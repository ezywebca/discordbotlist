/* Copyright (C) 2019 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const logger = require('../logger');

// This is a handler for non-dbl errors, like connection drops etc.
module.exports = async (error, ctx) => {
	if (error.code === 'EPIPE') {
		logger.warn(`EPIPE: ${ctx.path}`);
	} else if (error.code === 'ERR_STREAM_DESTROYED') {
		logger.warn(`ERR_STREAM_DESTROYED: ${ctx.path}`);
	} else {
		logger.err(`Error handling: ${ctx.path}`);
		logger.err(error.stack);
	}
};
