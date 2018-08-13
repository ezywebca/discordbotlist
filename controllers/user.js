const models = require('../models');
const {refreshUser} = require('../helpers');

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


		ctx.body = models.user.transform(await refreshUser(user));
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

		await refreshUser(user, true);

		ctx.status = 204;
	},
};
