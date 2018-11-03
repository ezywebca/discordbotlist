/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

module.exports = async (ctx, next) => {
	if (ctx.state.user && ctx.state.user.banned)
		throw {status: 403, message: 'You have been banned'};

	return next();
};
