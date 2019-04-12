/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const serviceBot = require('../bot');

const roles = process.env.ROLES.split(',').reduce((previous, role) => {
	const split = role.split(':');

	return {
		...previous,
		[split[0]]: split[1],
	};
}, {});

module.exports = role => async (ctx, next) => {
	if (!ctx.state.user)
		throw {status: 403, message: 'Access denied'};

	if (!ctx.state.user.admin && !serviceBot.hasRole(ctx.state.user.discord_id, roles[role]))
		throw {status: 403, message: 'Access denied'}; 

	return next();
};
