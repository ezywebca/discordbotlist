const Koa = require('koa');
const handler = require('./middleware/handler');
const logger = require('./middleware/logger');
const ip = require('./middleware/ip');
const koaBody = require('koa-body');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaCompress = require('koa-compress');

const app = new Koa();
const router = require('./router')(app);

app
	.use(handler)
	.use(ip)
	.use(logger)
	.use(koaCompress({
		threshold: 2048,
		flush: require('zlib').Z_SYNC_FLUSH
	}))
	.use(koaConditional())
	.use(koaEtag())
	.use(koaBody())
	.use(router.routes())
	.use(router.allowedMethods());

module.exports = app;
