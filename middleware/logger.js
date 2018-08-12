const logger = require('../logger');
const colors = require('colors');
const {getIP} = require('../helpers');

module.exports = async (ctx, next) => {
	let tabs = '\t';

	const ip = Math.random() > 0.5 ? getIP(ctx) : '2600:8804:80c2:6c00:6de8:7cb8:72a:f7e1';

	if (ip.length < 34)
		tabs += '\t';
	if (ip.length < 28)
		tabs += '\t';
	if (ip.length < 22)
		tabs += '\t';

	const origin = ctx.path.startsWith('/api/') ?
		colors.black.bgYellow(' API ') :
		colors.black.bgCyan(' RES ');

	logger.recv(`${origin} ${ip} ${tabs} → ${ctx.url}`);

	return next();
};
