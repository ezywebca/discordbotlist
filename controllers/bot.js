const models = require('../models');
const axios = require('axios');
const logger = require('../logger');
const Sequelize = require('sequelize');
const redis = require('../redis');
const _ = require('lodash');
const crypto = require('crypto');
const cryptojs = require('crypto-js');
const {attachBotStats, attachBotUpvotes, generateRandomString} = require('../helpers');
const serviceBot = require('../bot');
const webhooksQueue = require('../queues/webhooks');

const controller = {
	add: async (ctx, next) => {
		const {
			id,
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite,
		} = ctx.request.body;

		if (!id)
			throw {status: 422, message: 'Bot ID is missing'};

		if (!serviceBot.isInGuild(ctx.state.user.discord_id))
			throw {status: 422, message: 'Where are you in the official guild???'};
		
		verifyBotInfo(ctx.request.body);

		const botInfo = await axios.get('https://discordapp.com/api/v6/users/' + encodeURIComponent(id), {
			headers: {
				'Authorization': `Bot ${process.env.BOT_TOKEN}`,
			},
		}).then(response => response.data).catch(e => {
			if (e.response) {
				if (e.response.status === 400)
					throw {status: 422, message: 'Invalid Client ID'};
				if (e.response.status === 404)
					throw {status: 422, message: 'Bot with such Client ID doesn\'t exist'};
			}

			logger.err(e);
			throw {status: 500, message: 'Internal error'};
		});

		if (!botInfo.bot)
			throw {status: 422, message: 'Specified Client ID doesn\'t belong to a bot'};

		const existingBot = await models.bot.findOne({
			where: {discord_id: id},
			paranoid: false,
		});

		if (existingBot)
			if (existingBot.deleted_at)
				throw {status: 422, message: 'Contact a DBL administrator'};
			else 
				throw {status: 422, message: 'Bot is already added!'};
			
		const bot = await models.bot.create({
			owner_id: ctx.state.user.id,
			discord_id: id,
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite,
			username: botInfo.username,
			discriminator: botInfo.discriminator,
			avatar: botInfo.avatar,
		});

		const avatarUrl = botInfo.avatar ? `https://cdn.discordapp.com/avatars/${id}/${botInfo.avatar}.png?size=512`
			: `https://cdn.discordapp.com/embed/avatars/${botInfo.discriminator % 5}.png`;

		serviceBot.log({
			title: 'New bot added',
			url: `${ctx.origin}/bots/${id}`,
			image: avatarUrl,
			color: '#43b581',
			description: `
• Bot: **${botInfo.username}#${botInfo.discriminator}** (ID: **${id}**)		
• Owner: **${ctx.state.user.username}#${ctx.state.user.discriminator}** (ID: **${ctx.state.user.discord_id}**)
• Short description: **${short_description}**
• Prefix: **${prefix}**
• Website: ${website ? `[link](${website})` : 'None'}
• Invite: [link](${bot_invite})
• Server: [link](${server_invite})
`,
		});

		await serviceBot.ensureDevRole(ctx.state.user.discord_id);

		ctx.status = 204;
	},

	getMine: async (ctx, next) => {
		const bots = await ctx.state.user.getBots({
			include: [models.user]
		});

		if (bots.length > 0)
			await serviceBot.ensureDevRole(ctx.state.user.discord_id);
		else
			await serviceBot.ensureWithoutDevRole(ctx.state.user.discord_id);

		ctx.body = (await Promise.all(bots.map(async bot => {
			await attachBotUpvotes(bot, ctx.state.user);
			await attachBotStats(bot);
			return bot;
		}))).map(bot => models.bot.transform(bot, {includeWebhooks: true}));
	},

	get: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				discord_id: ctx.params.id
			},
			include: [models.user]
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		await attachBotStats(bot);
		await attachBotUpvotes(bot, ctx.state.user);

		ctx.body = models.bot.transform(bot, {includeWebhooks: ctx.state.user ? (ctx.state.user.id === bot.user_id || ctx.state.user.admin) : false});
	},

	index: async (ctx, next) => {
		if (ctx.query.all)
			return controller.getAll(ctx, next);
		else if (ctx.query.keywords)
			return controller.search(ctx, next);
		else
			return controller.getHot(ctx, next);
	},

	getHot: async (ctx, next) => {
		const cacheKey = 'bots:hot';
		let hotIds = JSON.parse(await redis.getAsync(cacheKey));

		if (!hotIds) {
			const start = Date.now();
			let bots = await models.bot.findAll({
				order: [['created_at', 'DESC']]
			});

			bots = await Promise.all(bots.map(async bot => {
				await attachBotUpvotes(bot, ctx.state.user);
				return bot;
			}));


			// We're retrieving a bit extra because we remove duplicates later, so we consistently provide 20 bots
			const newest = bots.slice(0, 10);
			const mostUpvoted = bots.sort((a,b) => a.upvotes > b.upvotes ? -1 : (a.upvotes < b.upvotes ? 1 : 0)).slice(0, 25);

			const mix = _.shuffle(_.uniqBy([
				...newest,
				...mostUpvoted
			], 'id').slice(0, 20));

			hotIds = mix.map(bot => bot.id);

			await redis.setAsync(cacheKey, JSON.stringify(hotIds), 'EX', 15 * 60);

			logger.info(`Refreshed hot bots list in ${Date.now() - start}ms`);
		}

		const bots = await models.bot.findAll({
			where: {
				id: {
					[Sequelize.Op.or]: hotIds,
				}
			},

			include: [models.user]
		});

		ctx.body = (await Promise.all(bots.map(async bot => {
			await attachBotUpvotes(bot, ctx.state.user);
			await attachBotStats(bot);
			return bot;
		}))).sort((a, b) => {
			if (hotIds.indexOf(a.id) < hotIds.indexOf(b.id))
				return -1;
			else if (hotIds.indexOf(a.id) > hotIds.indexOf(b.id))
				return 1;
			else
				return 0;
		}).map(bot => models.bot.transform(bot, {includeWebhooks: ctx.state.user ? (ctx.state.user.id === bot.user_id || ctx.state.user.admin) : false}));
	},

	search: async (ctx, next) => {
		const keywords = ctx.query.keywords;
		
		const bots = await models.bot.findAll({
			where: {
				[Sequelize.Op.or]: [
					{
						username: {
							[Sequelize.Op.like]: `%${keywords}%`
						}
					},
					{
						discriminator: {
							[Sequelize.Op.like]: `%${keywords}%`
						}
					},
					{
						short_description: {
							[Sequelize.Op.like]: `%${keywords}%`
						}
					},
				]
			},
			limit: 20,
			include: [models.user]
		});

		ctx.body = (await Promise.all(bots.map(async bot => {
			await attachBotUpvotes(bot, ctx.state.user);
			await attachBotStats(bot);
			return bot;
		}))).map(bot => models.bot.transform(bot, {includeWebhooks: ctx.state.user ? (ctx.state.user.id === bot.user_id || ctx.state.user.admin) : false}));
	},

	delete: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				discord_id: ctx.params.id
			},
			include: [models.user]
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
		if (ctx.state.user.id !== bot.owner_id && !ctx.state.user.admin)
			throw {status: 403, message: 'Access denied'};

		if ((await bot.user.getBots()).length > 1) // 1 because current bot is yet to be deleted
			await serviceBot.ensureDevRole(bot.user.discord_id);
		else
			await serviceBot.ensureWithoutDevRole(bot.user.discord_id);

		await bot.destroy();

		const avatarUrl = bot.avatar ? `https://cdn.discordapp.com/avatars/${bot.discord_id}/${bot.avatar}.png?size=512` :
			`https://cdn.discordapp.com/embed/avatars/${bot.discriminator % 5}.png`;

		serviceBot.log({
			title: 'Bot deleted',
			image: avatarUrl,
			color: '#f04747',
			description: `
• Bot: **${bot.username}#${bot.discriminator}** (ID: **${bot.discord_id}**)		
• Owner: **${bot.user.username}#${bot.user.discriminator}** (ID: **${bot.user.discord_id}**)
• Deleted by: **${ctx.state.user.username}#${ctx.state.user.discriminator}** (ID: **${ctx.state.user.discord_id}**)
`,
		});

		if (serviceBot.isInGuild(bot.discord_id))
			await serviceBot.kick(bot.discord_id, 'Deleted on bot list');

		ctx.status = 204;
	},

	upvote: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				discord_id: ctx.params.id
			},
			include: [models.user]
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		const lockKey = `bots:${bot.id}:upvote-locks:${ctx.state.user.id}`;
		const voteKey = `bots:${bot.id}:upvotes:${ctx.state.user.id}:${generateRandomString(4)}`;

		if (await redis.getAsync(lockKey))
			throw {status: 422, message: 'You can upvote once per 24 hours'};

		await redis.setAsync(voteKey, 1, 'EX', 3600 * 24 * 7); // a week
		await redis.setAsync(lockKey, 1, 'EX', 3600 * 24); // a day

		if (bot.webhook_url)
			webhooksQueue.createJob({
				url: bot.webhook_url,
				secret: bot.webhook_secret,
				user: ctx.state.user,
				bot,
			}).timeout(2000)
				.retries(5)
				.backoff('exponential', 500)
				.save();

		ctx.status = 204;
	},

	edit: async (ctx, next) => {
		const {
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite,
			webhook_url,
			webhook_secret,
		} = ctx.request.body;
		
		const bot = await models.bot.findOne({
			where: {discord_id: ctx.params.id},
			include: [models.user],
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
		if (ctx.state.user.id !== bot.owner_id && !ctx.state.user.admin)
			throw {status: 403, message: 'Access denied'};
		
		verifyBotInfo(ctx.request.body);

		if (webhook_url)
			if (!isURL(webhook_url))
				throw {status: 422, message: 'Invalid webhook URL'};
			else if (!webhook_secret)
				throw {status: 422, message: 'You can\'t assign a webhook without a secret'};

		let description = `
• Bot: **${bot.username}#${bot.discriminator}** (ID: **${bot.discord_id}**)		
• Owner: **${bot.user.username}#${bot.user.discriminator}** (ID: **${bot.user.discord_id}**)
• Edited by: **${ctx.state.user.username}#${ctx.state.user.discriminator}** (ID: **${ctx.state.user.discord_id}**)
`;

		if (short_description !== bot.short_description)
			description += `\n• New short description: **${short_description}**`;
		if (long_description !== bot.long_description)
			description += '\n• Long description changed';
		if (prefix !== bot.prefix)
			description += `\n• New prefix: **${prefix}**`;
		if (bot_invite !== bot.bot_invite)
			description += `\n• New invite: [link](${bot_invite})`;
		if (server_invite !== bot.server_invite)
			description += `\n• New server: [link](${server_invite})`;
		if (website !== bot.website)
			description += `\n• New website: ${website ? `[link](${website})` : 'None'}`;
		if (webhook_url)
			description += `\n• New webhook URL: [link](${webhook_url})`;
		if (webhook_secret)
			description += '\n• New webhook secret';

		await bot.update({
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite,
			webhook_url: webhook_url ? webhook_url : null,
			webhook_secret: webhook_secret ? webhook_secret : null,
		});

		const avatarUrl = bot.avatar ? `https://cdn.discordapp.com/avatars/${bot.discord_id}/${bot.avatar}.png?size=512` :
			`https://cdn.discordapp.com/embed/avatars/${bot.discriminator % 5}.png`;

		serviceBot.log({
			title: 'Bot edited',
			url: `${ctx.origin}/bots/${bot.discord_id}`,
			image: avatarUrl,
			color: '#e0cf37',
			description,
		});

		await serviceBot.ensureDevRole(bot.user.discord_id);

		ctx.status = 204;
	},

	refresh: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {discord_id: ctx.params.id}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		ctx.status = 204;
	},

	generateToken: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {discord_id: ctx.params.id}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
		if (ctx.state.user.id !== bot.owner_id && !ctx.state.user.admin)
			throw {status: 403, message: 'Access denied'};

		const token = crypto.randomBytes(32).toString('hex');

		await redis.setAsync(`bots:${bot.id}:token`, cryptojs.SHA256(token).toString());

		ctx.body = {token};
	},

	updateStats: async (ctx, next) => {
		const authorization = ctx.headers.authorization;

		if (!authorization)
			throw {status: 401, message: 'Unauthenticated'};
		if (!authorization.startsWith('Bot '))
			throw {status: 400, message: 'Bad authentication header'};
		if (!authorization.substring(4))
			throw {status: 401, message: 'Bad token'};

		const bot = await models.bot.findOne({
			where: {discord_id: ctx.params.id}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
		
		const token = authorization.substring(4);
		const hashedToken = await redis.getAsync(`bots:${bot.id}:token`);

		if (!hashedToken || cryptojs.SHA256(token).toString() !== hashedToken)
			throw {status: 401, message: 'Bad token'};

		const {shard_id, guilds, users, voice_connections} = ctx.request.body;

		if (shard_id && !isInt(shard_id))
			throw {status: 422, message: 'The \'shard_id\' parameter must be a number'};
		if (guilds && !isInt(guilds))
			throw {status: 422, message: 'The \'guilds\' parameter must be a number'};
		if (users && !isInt(users))
			throw {status: 422, message: 'The \'users\' parameter must be a number'};
		if (voice_connections && !isInt(voice_connections))
			throw {status: 422, message: 'The \'voice_connections\' parameter must be a number'};

		const stats = JSON.parse(await redis.getAsync(`bots:${bot.id}:stats`)) || [];
		const shardStats = stats.find(x => x.shard_id === parseInt(shard_id || 0));

		if (shardStats) {
			if (guilds)
				shardStats.guilds = parseInt(guilds);
			else
				delete shardStats.guilds;
			if (users)
				shardStats.users = parseInt(users);
			else
				delete shardStats.users;
			if (voice_connections)
				shardStats.voiceConnections = parseInt(voice_connections);
			else
				delete shardStats.voiceConnections;
		} else {
			const newStats = {
				shard_id: parseInt(shard_id || 0)
			};
			if (guilds)
				newStats.guilds = parseInt(guilds);
			if (users)
				newStats.users = parseInt(users);
			if (voice_connections)
				newStats.voiceConnections = parseInt(voice_connections);
			stats.push(newStats);
		}

		await redis.setAsync(`bots:${bot.id}:stats`, JSON.stringify(stats));

		ctx.status = 204;
	},

	resetStats: async (ctx, next) => {
		const authorization = ctx.headers.authorization;

		if (!authorization)
			throw {status: 401, message: 'Unauthenticated'};
		if (!authorization.startsWith('Bot '))
			throw {status: 400, message: 'Bad authentication header'};
		if (!authorization.substring(4))
			throw {status: 401, message: 'Bad token'};

		const bot = await models.bot.findOne({
			where: {discord_id: ctx.params.id}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
		
		const token = authorization.substring(4);
		const hashedToken = await redis.getAsync(`bots:${bot.id}:token`);

		if (!hashedToken || cryptojs.SHA256(token).toString() !== hashedToken)
			throw {status: 401, message: 'Bad token'};

		await redis.delAsync(`bots:${bot.id}:stats`);

		ctx.status = 204;
	},

	getAll: async (ctx, next) => {
		if (ctx.query.skip && (!isInt(ctx.query.skip) || ctx.query.skip < 0))
			throw {status: 404, message: '\'skip\' parameter must be a number'};

		const skip = parseInt(ctx.query.skip) || 0;

		const bots = await models.bot.findAll({
			order: [['updated_at', 'DESC']],
			limit: skip + 20,
		});

		ctx.body = await Promise.all(bots.slice(skip, skip + 20).map(async bot => {
			await attachBotUpvotes(bot, ctx.state.user);
			await attachBotStats(bot);
			return models.bot.transform(bot, {includeWebhooks: ctx.state.user ? (ctx.state.user.id === bot.user_id || ctx.state.user.admin) : false});
		}));
	},

	verify: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				discord_id: ctx.params.id,
			}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		bot.verified = true;
		await bot.save();
		
		ctx.status = 204;
	},

	unverify: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				discord_id: ctx.params.id,
			}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		bot.verified = false;
		await bot.save();

		ctx.status = 204;
	},

	getUninvited: async (ctx, next) => {
		const bots = await models.bot.findAll();
		const uninvitedBots = bots.filter(bot => !serviceBot.isInGuild(bot.discord_id));

		ctx.body = await Promise.all(uninvitedBots.map(async bot => {
			await attachBotUpvotes(bot, ctx.state.user);
			await attachBotStats(bot);
			return models.bot.transform(bot, {includeWebhooks: ctx.state.user ? (ctx.state.user.id === bot.user_id || ctx.state.user.admin) : false});
		}));
	}
};

function isInt(value) {
	let x;
	if (isNaN(value))
		return false;
	x = parseFloat(value);
	return (x | 0) === x;
}

function isURL(url) {
	try {
		const obj = new URL(url);
		if (!obj.protocol.startsWith('http') && !obj.protocol.startsWith('https'))
			return false;
		return true;
	} catch (e) {
		return false;
	}
}

function verifyBotInfo({
	short_description,
	long_description,
	prefix,
	website,
	bot_invite,
	server_invite
}) {
	if (!short_description)
		throw {status: 422, message: 'Short description is missing'};
	if (!prefix)
		throw {status: 422, message: 'Prefix is missing'};
	if (!bot_invite)
		throw {status: 422, message: 'Bot invite is missing'};

	if (short_description.length < 32)
		throw {status: 422, message: 'Short description is too short'};
	if (short_description.length > 191)
		throw {status: 422, message: 'Short description is too long'};
	if (long_description.length > 16384)
		throw {status: 422, message: 'Long description is too long'};
	if (prefix.length > 48)
		throw {status: 422, message: 'Prefix is too long'};
	if (bot_invite.length > 191)
		throw {status: 422, message: 'Bot invite is too long'};

	if (website && !isURL(website))
		throw {status: 422, message: 'Invalid website URL'};
	if (bot_invite && !isURL(bot_invite))
		throw {status: 422, message: 'Invalid bot invite URL'};
	if (server_invite && !isURL(server_invite))
		throw {status: 422, message: 'Invalid server invite URL'};
}


module.exports = controller;
