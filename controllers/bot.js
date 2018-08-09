const models = require('../models');
const axios = require('axios');
const logger = require('../logger');
const Sequelize = require('sequelize');
const redis = require('../redis');
const _ = require('lodash');

const controller = {
	add: async (ctx, next) => {
		const {
			client_id,
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite,
		} = ctx.request.body;

		if (!client_id)
			throw {status: 422, message: 'Client ID is missing'};

		
		verifyBotInfo(ctx.request.body);

		const botInfo = await axios.get('https://discordapp.com/api/v6/users/' + encodeURIComponent(client_id), {
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
			where: {client_id}
		});

		if (existingBot)
			throw {status: 422, message: 'Bot is already added!'};
			
		const bot = await models.bot.create({
			owner_id: ctx.state.user.id,
			client_id,
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

		ctx.status = 204;
	},

	getMine: async (ctx, next) => {
		const bots = await ctx.state.user.getBots({
			include: [models.user]
		});

		ctx.body = (await Promise.all((await Promise.all(bots.map(refreshBot)))
			.map(async bot => {
				const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
				bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
				bot.upvotes = upvotes.length;
				return bot;
			})))
			.map(bot => models.bot.transform(bot));
	},

	get: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				client_id: ctx.params.id
			},
			include: [models.user]
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		await refreshBot(bot);

		const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
		bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
		bot.upvotes = upvotes.length;

		ctx.body = models.bot.transform(bot);
	},

	index: async (ctx, next) => {
		if (ctx.query.keywords) {
			return controller.search(ctx, next);
		} else return controller.getHot(ctx, next);
	},

	getHot: async (ctx, next) => {
		const start = Date.now();

		const cacheKey = 'bots:hot';
		let hotIds = JSON.parse(await redis.getAsync(cacheKey));

		if (!hotIds) {
			let bots = await models.bot.findAll({
				order: [['created_at', 'DESC']]
			});

			bots = await Promise.all(bots.map(async bot => {
				const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
				bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
				bot.upvotes = upvotes.length;
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
			const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
			bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
			bot.upvotes = upvotes.length;
			return refreshBot(bot);
		}))).sort((a, b) => {
			if (hotIds.indexOf(a.id) < hotIds.indexOf(b.id))
				return -1;
			else if (hotIds.indexOf(a.id) > hotIds.indexOf(b.id))
				return 1;
			else
				return 0;
		}).map(models.bot.transform);

		logger.info(`Refreshed hot bots list in ${Date.now() - start}ms`);
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

		ctx.body = (await Promise.all((await Promise.all(bots.map(refreshBot)))
			.map(async bot => {
				const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
				bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
				bot.upvotes = upvotes.length;
				return bot;
			})))
			.map(models.bot.transform);
	},

	delete: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				client_id: ctx.params.id
			},
			include: [models.user]
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
		if (ctx.state.user.id !== bot.owner_id && !ctx.state.user.admin)
			throw {status: 403, message: 'Access denied'};

		await bot.destroy();

		ctx.status = 204;
	},

	upvote: async (ctx, next) => {
		const bot = await models.bot.findOne({
			where: {
				client_id: ctx.params.id
			},
			include: [models.user]
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};

		const voteKey = `bots:${bot.id}:upvotes:${ctx.state.user.id}`;

		if (await redis.getAsync(voteKey))
			throw {status: 422, message: 'You can only vote once per 12 hours'};
		
		await redis.setAsync(voteKey, 1, 'EX', 3600 * 12); // 12 hours

		ctx.status = 204;
	},

	edit: async (ctx, next) => {
		const {
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite
		} = ctx.request.body;

		
		const bot = await models.bot.findOne({
			where: {client_id: ctx.params.id}
		});

		if (!bot)
			throw {status: 404, message: 'Not found'};
			
		await bot.update({
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite
		});

		ctx.status = 204;
	},
};

function isURL(url) {
	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}

async function refreshBot(bot) {
	try {
		const cacheKey = `bots:${bot.id}:fresh`;

		if (!(await redis.getAsync(cacheKey))) {
			const newBotInfo = await axios.get('https://discordapp.com/api/v6/users/' + encodeURIComponent(bot.client_id), {
				headers: {
					'Authorization': `Bot ${process.env.BOT_TOKEN}`,
				},
			}).then(response => response.data);

			bot.username = newBotInfo.username;
			bot.discriminator = newBotInfo.discriminator;
			bot.avatar = newBotInfo.avatar;

			bot.changed('updated_at', true); // Because users need to know our info is up to date! ha!

			await bot.save();
			await bot.reload(); // Because Sequelize is too dumb to replace CURRENT_TIMESTAMP with the actual current timestamp after save
			await redis.setAsync(cacheKey, 1, 'EX', 15 * 60);

			logger.info(`Refreshed bot: ${bot.client_id}`);
		}
	} catch (e) {
		logger.warn(`Could not refresh bot: ${bot.client_id}`);
		logger.warn(e);
	}

	return bot;
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
	if (long_description.length > 8192)
		throw {status: 422, message: 'Long description is too long'};
	if (prefix.length > 16)
		throw {status: 422, message: 'Prefix is too long'};
	if (bot_invite.length > 191)
		throw {status: 422, message: 'Bot invite is too long'};

	if (website && !isURL(website))
		throw {status: 422, message: 'Invalid website URL'};
	if (bot_invite && !isURL(bot_invite))
		throw {status: 422, message: 'Invalid bot invite URL'};
	if (server_invite && !isURL(server_invite))
		throw {status: 422, message: 'Invalid server invite URL'};
};


module.exports = controller;