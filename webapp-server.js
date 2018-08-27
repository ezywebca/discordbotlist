const Koa = require('koa');
const app = new Koa();
const fs = require('pn/fs');
const path = require('path');

const handler = require('./middleware/handler');
const loggerMiddleware = require('./middleware/logger');

const koaConditional = require('koa-conditional-get');
const koaEtag = require('koa-etag');
const koaStatic = require('koa-static');
const koaCompress = require('koa-compress');

const ejs = require('ejs');
const models = require('./models');
const {attachBotStats, refreshBot, formatNumber} = require('./helpers');
const redis = require('./redis');
const moment = require('moment-mini');

const {
	createBundleRenderer
} = require('vue-server-renderer');
const {isCrawler, getIP} = require('./helpers');

app.use(handler);
app.use(koaCompress({
	threshold: 2048,
	flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(koaConditional());
app.use(koaEtag());

app.use(loggerMiddleware);

async function renderApp(ctx) {
	const template = await fs.readFile(path.join(__dirname, 'build', 'index.html'), 'utf8');
	const ssrManifest = JSON.parse(await fs.readFile(path.join(__dirname, 'build', 'vue-ssr-server-bundle.json'), 'utf8'));

	const renderer = createBundleRenderer(ssrManifest, {
		runInNewContext: true,
		template
	});

	const context = {
		url: ctx.url.endsWith('?') ? ctx.url.slice(0, -1) : ctx.url, // It crashes otherwise
		authCookie: ctx.cookies.get('auth'),
		discordRedirect: process.env.OAUTH_DISCORD_REDIRECT,
		discordId: process.env.OAUTH_DISCORD_ID,
	};

	return await renderer.renderToStream(context);
}

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
				users: await models.user.findAll(),
				absolute: relative => ctx.origin + relative,
			});
		} else {
			ctx.status = 403;
			ctx.body = 'Access denied';
		}
	} else if (ctx.path.match('/bots/\\d+/widget/*')) {
		const discordId = ctx.path.substring(6).split('/')[0];
		const bot = await models.bot.findOne({
			where: {discord_id: discordId},
			include: [models.user],
		});

		if (!bot) {
			ctx.type = 'text/html; charset=utf-8';
			ctx.body = 'Not found';
		} else {
			await refreshBot(bot);
			await attachBotStats(bot);
			const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
			bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
			bot.upvotes = upvotes.length;
			const template = await fs.readFile(path.join('webapp', 'widget-template.ejs'), 'utf8');
			ctx.type = 'image/svg+xml; charset=utf-8';

			const items = [];

			if (bot.stats.guilds)
				items.push(`${formatNumber(bot.stats.guilds)} guilds`);
			if (bot.stats.users)
				items.push(`${formatNumber(bot.stats.users)} users`);
			if (bot.stats.voice_connections)
				items.push(`${formatNumber(bot.stats.voice_connections)} voice connections`);

			if (items.length < 2)
				items.push(`Currently ${bot.stats.online ? 'online' : 'offline'}`);
			if (items.length < 2)
				items.push(`Updated ${moment.utc(bot.updated_at).fromNow()}`);

			ctx.body = ejs.render(template, {
				items,
				upvotes: formatNumber(bot.upvotes),
				username: bot.username,
				link: `https://discordbotlist.com/bots/${bot.discord_id}`,
			});
		}
	} else {
		ctx.type = 'text/html; charset=utf-8';
		ctx.body = await renderApp(ctx);
	}
});

module.exports = app;
