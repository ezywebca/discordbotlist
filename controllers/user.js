const models = require('../models');
const axios = require('axios');
const redis = require('../redis');
const logger = require('../logger');

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
	}
};

async function refreshUser(user) {
	try {
		const cacheKey = `user:${user.id}:fresh`;

		if (!(await redis.getAsync(cacheKey))) {
			const newUserInfo = await axios.get('https://discordapp.com/api/v6/users/' + encodeURIComponent(user.discord_id), {
				headers: {
					'Authorization': `Bot ${process.env.BOT_TOKEN}`,
				},
			}).then(response => response.data);

			user.username = newUserInfo.username;
			user.discriminator = newUserInfo.discriminator;
			user.avatar = newUserInfo.avatar;

			user.changed('updated_at', true); // Because users need to know our info is up to date! ha!

			await user.save();
			await user.reload(); // Because Sequelize is too dumb to replace CURRENT_TIMESTAMP with the actual current timestamp after save
			await redis.setAsync(cacheKey, 1, 'EX', 15 * 60);

			logger.info(`Refreshed user: ${user.discord_id}`);
		}
	} catch (e) {
		logger.warn(`Could not refresh user: ${user.discord_id}`);
		logger.warn(e);
	}

	return user;
}