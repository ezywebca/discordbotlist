/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const logger = require('../logger');
const colors = require('colors');
const {getIP} = require('../helpers');

module.exports = async (ctx, next) => {
	let tabs = '\t';

	const ip =  getIP(ctx);

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
