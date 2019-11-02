/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const logger = require('../logger');
const DBLockedError = require('../errors/db-locked-error');

module.exports = async (ctx, next) => {
	try {
		await next();

		if (ctx.status === 404 && !ctx.body) {
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
		if (e instanceof DBLockedError) {
			ctx.status = 503;
			ctx.body = {
				error: 'Service unavailable, try again later'
			};
		} else if (e.status && e.message) {
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
