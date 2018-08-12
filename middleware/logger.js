const logger = require('../logger');
const colors = require('colors');
const {getIP} = require('../helpers');

module.exports = async (ctx, next) => {
	let tabs = '\t';

	const ip = getIP(ctx);

	if (ip.toString().length < 8)
		tabs += '\t';

	const origin = ctx.path.startsWith('/api/') ?
		colors.black.bgYellow(' API ') :
		colors.black.bgCyan(' RES ');

	logger.recv(`${origin} ${ip} ${tabs} → ${ctx.url}`);

	return next();
};
