const redis = require('../redis');
const { median } = require('../helpers');

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
	},

	async getApprovalDelay(ctx) {
		const cacheKeys = await redis.keysAsync('bots:*:approval-delay');

		let average = 0;

		if (cacheKeys.length > 0) {
			const delays = await redis.mgetAsync(cacheKeys)
				.then(values => values.map(v => Number(v)));

			average = delays && delays.length > 0 ? median(delays) : 0;
		}

		ctx.body = {
			median: Math.round(average),
		};
	}
};
