const logger = require('../logger');

module.exports = async (ctx, next) => {
	try {
		await next();

		if (ctx.status === 404) {
			ctx.status = 404;
			ctx.body = {
				error: 'Not found',
			};
		} else if (ctx.status === 405) {
			ctx.status = 405;
			ctx.body = {
				error: 'Method not allowed',
			};
		}
	} catch (e) {
		if (e.status && e.message) {
			ctx.status = e.status;
			ctx.body = {
				error: e.message
			};
		} else {
			if (e.status === 401) {
				ctx.status = 401;
				ctx.body = {
					error: 'Authentication required',
				};
			} else {
				ctx.status = 500;
				ctx.body = {
					error: 'Internal error'
				};

				logger.err(e.stack);
			}
		}
	}
};
