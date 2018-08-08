const models = require('../models');
const axios = require('axios');
const logger = require('../logger');
const Sequelize = require('sequelize');
const redis = require('../redis');

const controller = {
	add: async (ctx, next) => {
		const {
			client_id,
			short_description,
			long_description,
			prefix,
			website,
			bot_invite,
			server_invite
		} = ctx.request.body;

		if (!client_id)
			throw {status: 422, message: 'Client ID is missing'};
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
				const upvotes = await redis.keysAsync(`bot:${bot.id}:upvote:*`);
				bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bot:${bot.id}:upvote:${ctx.state.user.id}`);
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

		const upvotes = await redis.keysAsync(`bot:${bot.id}:upvote:*`);
		bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bot:${bot.id}:upvote:${ctx.state.user.id}`);
		bot.upvotes = upvotes.length;

		ctx.body = models.bot.transform(bot);
	},

	index: async (ctx, next) => {
		if (ctx.query.keywords) {
			return controller.search(ctx, next);
		} else return controller.getHot(ctx, next);
	},

	getHot: async (ctx, next) => {
		const newBots = await models.bot.findAll({
			limit: 20,
			orderBy: ['created_at'],
			include: [models.user]
		});

		// TODO: mix with most upvoted

		ctx.body = (await Promise.all((await Promise.all(newBots.map(refreshBot)))
			.map(async bot => {
				const upvotes = await redis.keysAsync(`bot:${bot.id}:upvote:*`);
				bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bot:${bot.id}:upvote:${ctx.state.user.id}`);
				bot.upvotes = upvotes.length;
				return bot;
			})))
			.map(models.bot.transform);
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
				const upvotes = await redis.keysAsync(`bot:${bot.id}:upvote:*`);
				bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bot:${bot.id}:upvote:${ctx.state.user.id}`);
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

		const voteKey = `bot:${bot.id}:upvote:${ctx.state.user.id}`;

		if (await redis.getAsync(voteKey))
			throw {status: 422, message: 'You can only vote once per week'};
		
		await redis.setAsync(voteKey, 1, 'EX', 3600 * 24 * 7); // a week

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
		const cacheKey = `bot:${bot.id}:fresh`;

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


module.exports = controller;