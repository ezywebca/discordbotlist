const logger = require('../logger');
const colors = require('colors');
const {getIP} = require('../helpers');

module.exports = async (ctx, next) => {
	let tabs = '\t';

	if (ip.length < 34)
		tabs += '\t';
	if (ip.length < 28)
		tabs += '\t';
	if (ip.length < 22)
		tabs += '\t';

	const origin = ctx.path.startsWith('/api/') ?
		colors.black.bgYellow(' API ') :
		colors.black.bgCyan(' RES ');

	logger.recv(`${origin} ${getIP(ctx)} ${tabs} → ${ctx.url}`);

	return next();
};
