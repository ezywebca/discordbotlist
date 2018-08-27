const models = require('../models');
const {attachBotStats} = require('../helpers');
const redis = require('../redis');

module.exports = {
	get: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: ctx.params.id
			},
			include: [models.bot]
		});

		if (!user)
			throw {status: 404, message: 'Not found'};

		user.bots = await Promise.all(user.bots.map(async bot => {
			const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
			bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
			bot.upvotes = upvotes.length;
			await attachBotStats(bot);
			return bot;
		}));

		ctx.body = models.user.transform(user);
	},

	ban: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: ctx.params.id
			}
		});

		if (!user)
			throw {status: 404, message: 'Not found'};

		if (user.admin)
			throw {status: 403, message: 'You can\'t ban an admin'};

		user.banned = true;
		await user.save();

		ctx.status = 204;
	},

	unban: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: ctx.params.id
			}
		});

		if (!user)
			throw {status: 404, message: 'Not found'};
		if (user.admin)
			throw {status: 403, message: 'You can\'t unban an admin'};

		user.banned = false;
		await user.save();

		ctx.status = 204;
	},

	refresh: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: ctx.params.id,
			}
		});

		if (!user)
			throw {status: 404, message: 'Not found'};

		ctx.status = 204;
	},
};
