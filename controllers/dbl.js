const redis = require('../redis');

module.exports = {
	lockDB: async (ctx, next) => {
		await redis.setAsync('db-lock', 1);

		ctx.status = 204;
	},

	unlockDB: async (ctx, next) => {
		await redis.delAsync('db-lock');

		ctx.status = 204;
	},

	getConfig: async (ctx, next) => {
		ctx.body = {
			db_locked: !!(await redis.getAsync('db-lock')),
		};
	}
};
