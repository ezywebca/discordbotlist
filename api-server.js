/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const Koa = require('koa');
const handler = require('./middleware/handler');
const logger = require('./middleware/logger');
const koaBody = require('koa-body');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaCompress = require('koa-compress');

const app = new Koa();
const router = require('./router')(app);

app
	.use(handler)
	.use(logger)
	.use(koaCompress({
		threshold: 2048,
		flush: require('zlib').Z_SYNC_FLUSH
	}))
	.use(koaConditional())
	.use(koaEtag())
	.use(koaBody({
		multipart: true,
	}))
	.use(router.routes())
	.use(router.allowedMethods());

module.exports = app;
