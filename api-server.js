const Koa = require('koa');
const handler = require('./middleware/handler');
const errorHandler = require('./utils/error-handler');
const logger = require('./middleware/logger');
const koaBody = require('koa-body');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const cors = require('koa2-cors');
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
	.use((ctx, next) => {
		if (ctx.path.startsWith('/api/bots'))
			return cors({
				origin: '*',
				maxAge: 864000, // 10d
				allowHeaders: ['Authorization', 'Accept', 'Content-Type'],
			})(ctx, next);
		else
			return next();
	})
	.use(koaBody({
		multipart: true,
	}))
	.use(router.routes())
	.use(router.allowedMethods());

app.on('error', errorHandler);

module.exports = app;
