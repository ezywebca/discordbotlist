const models = require('../models');
const cryptojs = require('crypto-js');
const _ = require('lodash');

module.exports = (passthrough = false) => async (ctx, next) => {
	const error = {status: 401, message: 'Authentication token expired'};
	
	if (ctx.state.user) {
		const user = await models.user.findOne({
			where: {
				id: ctx.state.user.id
			},
		});

		if (!user)
			if (passthrough)
				ctx.state.user = undefined;
			else
				throw error;

		const priv = cryptojs.SHA256(JSON.stringify(_.pick(user, ['id', 'discord_id', 'banned', 'admin']))).toString();

		if (user && priv === ctx.state.user.priv)
			ctx.state.user = user;
		else if (passthrough) {
			ctx.state.user = undefined;
			return next();
		} else throw error;
	} else if (!passthrough)
		throw error;

	return next();
};
