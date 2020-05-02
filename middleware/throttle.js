const redis = require('../redis');
const {getIP} = require('../helpers');

module.exports = function (limit = 60, reset = 60, successOnly = false) {
	return async (ctx, next) => {
		/* istanbul ignore next */
		if (process.env.NODE_ENV === 'development')
			return next();

		const key = `throttle:${getIP(ctx)}:${ctx.url}`;
		const client = JSON.parse(await redis.getAsync(key));

		if (client && client.requests >= limit)
			throw {status: 429, message: 'Too many requests'};

		await next();

		if (!successOnly || (successOnly && ctx.status < 400)) {
			if (client)
				await redis.setAsync(key, JSON.stringify({
					...client,
					requests: client.requests + 1,
				}), 'EX', reset);
			else await redis.setAsync(key, JSON.stringify({
				requests: 1,
			}), 'EX', reset);
		}
	};
};
