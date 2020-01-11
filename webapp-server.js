/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const Koa = require('koa');
const app = new Koa();
const fs = require('pn/fs');
const path = require('path');

const handler = require('./middleware/handler');
const errorHandler = require('./utils/error-handler');
const loggerMiddleware = require('./middleware/logger');
const logger = require('./logger');

const koaRange = require('koa-range');
const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaStatic = require('koa-static');
const koaCompress = require('koa-compress');

const LRU = require('lru-cache');

const ejs = require('ejs');
const models = require('./models');
const {attachBotStats, formatNumber} = require('./helpers');
const redis = require('./redis');
const moment = require('moment-mini');

const {createBundleRenderer} = require('vue-server-renderer');
const {isCrawler, getIP, getAvatar} = require('./helpers');

const util = require('util');
const i2b = util.promisify(require('imageurl-base64'));
const { debounce } = require('lodash');

async function renderAvatar(bot) {
	const url = getAvatar(bot);
	const cacheKey = `bots:${bot.id}:avatars:${Buffer.from(url).toString('base64')}`;
	const cached = await redis.getAsync(cacheKey);

	if (cached)
		return cached;

	const b64 = (await i2b(url)).dataUri;

	await redis.setAsync(cacheKey, b64, 'EX', 7 * 24 * 60 * 60); // 1 week

	return b64;
}

function createAppRenderer() {
	const template = fs.readFileSync(path.join(__dirname, 'build', 'index.html'), 'utf8');
	const ssrManifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'vue-ssr-server-bundle.json'), 'utf8'));
	return createBundleRenderer(ssrManifest, {
		runInNewContext: false,
		template,
		cache: LRU({
			max: 100,
			maxAge: 1000,
		}),
	});
}

let renderer = createAppRenderer();

const refreshRenderer = debounce(() => {
	renderer = createAppRenderer();
	logger.info('Refreshed app renderer');
}, 500);

fs.watch(path.join(__dirname, 'build', 'index.html'), refreshRenderer);
fs.watch(path.join(__dirname, 'build', 'vue-ssr-server-bundle.json'), refreshRenderer);

function renderApp(ctx) {
	const context = {
		url: ctx.url.endsWith('?') ? ctx.url.slice(0, -1) : ctx.url, // It crashes otherwise
		authCookie: ctx.cookies.get('auth'),
		dataSaverCookie: ctx.cookies.get('data-saver'),
		discordRedirect: process.env.OAUTH_DISCORD_REDIRECT,
		discordId: process.env.OAUTH_DISCORD_ID,
	};

	return renderer.renderToString(context);
}

app.use(handler);
app.use(koaRange);
app.use(koaCompress({
	threshold: 2048,
	flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(koaConditional());
app.use(koaEtag());

app.use(loggerMiddleware);

app.use(koaStatic('./public', {
	maxage: 1000 * 60 * 60 * 24 * 30,
}));

app.use(async (ctx, next) => {
	if (ctx.path === '/sitemap.xml') {
		if (await isCrawler(getIP(ctx))) {
			const template = await fs.readFile(path.join('webapp', 'sitemap.ejs'), 'utf8');
			ctx.type = 'application/xml; charset=utf-8';
			ctx.body = ejs.render(template, {
				bots: await models.bot.findAll(),
				tags: await models.tag.findAll(),
				absolute: relative => ctx.origin + relative,
				sanitizeTag: tag => tag.replace(/\s/g, '-').toLowerCase(),
			});
		} else {
			ctx.status = 403;
			ctx.body = 'Access denied';
		}
	} else if (ctx.path.match('/bots/\\d+/widget/*')) {
		const discordId = ctx.path.substring(6).split('/')[0];
		const bot = await models.bot.findOne({
			where: {bot_id: discordId},
			include: [models.user],
		});

		if (!bot) {
			ctx.type = 'text/html; charset=utf-8';
			ctx.body = 'Not found';
		} else {
			await attachBotStats(bot);
			const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
			bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
			bot.upvotes = upvotes.length;
			const template = await fs.readFile(path.join('webapp', 'widget-template.ejs'), 'utf8');
			ctx.type = 'image/svg+xml; charset=utf-8';

			const items = [];

			items.push(`${formatNumber(bot.upvotes)} upvotes`);

			if (bot.stats.guilds)
				items.push(`${formatNumber(bot.stats.guilds)} servers`);
			if (bot.stats.users)
				items.push(`${formatNumber(bot.stats.users)} users`);
			if (bot.stats.voice_connections)
				items.push(`${formatNumber(bot.stats.voice_connections)} voice connections`);

			if (items.length < 3)
				items.push(`Currently ${bot.stats.online ? 'online' : 'offline'}`);
			if (items.length < 3)
				items.push(`Updated ${moment.utc(bot.updated_at).fromNow()}`);

			const theme = {
				light: false,
				background: '#202225',
			};

			if (ctx.query.bg && /^([0-9A-Fa-f]{3}){1,2}$/.test(ctx.query.bg)) {
				const fullHex = ctx.query.bg.length === 6
					? ctx.query.bg
					: ctx.query.bg
						.split('')
						.map(c =>  `${c}${c}`)
						.join('');

				theme.background = `#${fullHex}`;

				const rgb = parseInt(fullHex, 16);
				const r = (rgb >> 16) & 0xff;
				const g = (rgb >>  8) & 0xff;
				const b = (rgb >>  0) & 0xff;

				const luma = 0.299 * r + 0.587 * g + 0.114 * b; // per ITU-R BT.601

				if (luma > 125) {
					theme.light = true;
				}
			}

			ctx.body = ejs.render(template, {
				items,
				username: bot.username,
				avatar: await renderAvatar(bot),
				online: bot.stats.online,
				verified: bot.verified,
				theme,
				link: `https://discordbotlist.com/bots/${bot.bot_id}`,
			});
		}
	} else {
		ctx.type = 'text/html; charset=utf-8';

		try {
			if (ctx.path === '/404')
				ctx.status = 404;

			ctx.body = await renderApp(ctx);
		} catch (error) {
			if (error.status === 404) {
				ctx.redirect('/404');
			} else {
				ctx.body = 'Internal Server Error';
			}
		}
	}
});

app.on('error', errorHandler);

module.exports = app;
