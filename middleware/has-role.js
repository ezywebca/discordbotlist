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
