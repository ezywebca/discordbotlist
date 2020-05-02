const dns = require('dns');
const serviceBot = require('./bot');
const redis = require('./redis');
const DBLockedError = require('./errors/db-locked-error');

async function isCrawler(ip) {
	return await isDdgBot(ip) ||
		await isGoogleBot(ip) ||
		await isBingBot(ip);
}

async function isDdgBot(ip) {
	return [
		'72.94.249.34',
		'72.94.249.35',
		'72.94.249.36',
		'72.94.249.37',
		'72.94.249.38',
	].indexOf(ip) !== -1;
}


async function isGoogleBot(ip) {
	return new Promise((resolve, reject) => {
		dns.reverse(ip, (err, hosts) => {
			if (err) {
				if (err.code === 'ENOTFOUND') {
					resolve(false);
				} else {
					reject(err);
				}
			} else {
				const host = hosts[0];

				if (!host || !(host.endsWith('.googlebot.com') || host.endsWith('.google.com'))) {
					resolve(false);
				} else {
					dns.lookup(host, (err, addr) => {
						if (err)
							reject(err);
						else
							resolve(addr === ip);
					});
				}
			}
		});
	});
}

async function isBingBot(ip) {
	return new Promise((resolve, reject) => {
		dns.reverse(ip, (err, hosts) => {
			if (err) {
				if (err.code === 'ENOTFOUND') {
					return resolve(false);
				} else {
					return reject(err);
				}
			} else {
				const host = hosts[0];

				if (!host || !host.endsWith('search.msn.com')) {
					resolve(false);
				} else {
					dns.lookup(host, (err, addr) => {
						if (err)
							reject(err);
						else
							resolve(addr === ip);
					});
				}
			}
		});
	});
}

function getIP(ctx) {
	return ctx.request.headers['cf-connecting-ip'] || ctx.ip;
}


async function attachBotStats(bot) {
	const stats = JSON.parse(await redis.getAsync(`bots:${bot.id}:stats`));

	bot.stats = {
		online: serviceBot.isOnline(bot.bot_id),
	};

	if (!stats || stats.length < 1)
		return;

	let showGuilds = stats.reduce((acc, item) => acc && !!item.guilds, true);
	let showUsers = stats.reduce((acc, item) => acc && !!item.users, true);
	let showVoiceConnections = stats.reduce((acc, item) => acc && !!item.voiceConnections, true);

	let guilds = 0;
	let users = 0;
	let voiceConnections = 0;

	stats.forEach(item => {
		if (showGuilds)
			guilds += item.guilds;
		if (showUsers)
			users += item.users;
		if (showVoiceConnections)
			voiceConnections += item.voiceConnections;
	});

	if (showGuilds)
		bot.stats.guilds = guilds;
	if (showUsers)
		bot.stats.users = users;
	if (showVoiceConnections)
		bot.stats.voice_connections = voiceConnections;
}

async function attachBotUpvotes(bot, user) {
	if (user)
		bot.upvote_lock = !!(await redis.getAsync(`bots:${bot.id}:upvote-locks:${user.id}`));
	else
		bot.upvote_lock = false;

	bot.upvotes = (await redis.keysAsync(`bots:${bot.id}:upvotes:*`)).length;
}

// https://codebottle.io/s/2a5e5efd87
function shorten(str, len, ellipsis = '…') {
	if (str.length <= len)
		return str;

	var result = str.substr(0, len - 1);
	result = result.substr(0, Math.min(result.length, result.lastIndexOf(' ')));

	return result + ellipsis;
}

// https://codebottle.io/s/61ca238092
function formatNumber(num) {
	if (num > 999999999)
		return `${(num/1e9).toFixed(1)}B`;
	if (num > 999999)
		return `${(num/1e6).toFixed(1)}M`;
	if (num > 999)
		return `${(num/1e3).toFixed(1)}K`;

	return `${num}`; // returned type consistency
}

async function checkDBLock() {
	const dbLock = await redis.getAsync('db-lock');

	if (dbLock)
		throw new DBLockedError();
}

function getAvatar(entity) {
	if (entity.avatar)
		return `https://cdn.discordapp.com/avatars/${entity.bot_id}/${entity.avatar}.png?size=512`;
	else
		return `https://cdn.discordapp.com/embed/avatars/${entity.discriminator % 5}.png`;
}

function generateRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function sanitize(thing, type = 'string') {
	if (typeof(thing) === 'undefined')
		return undefined;
	else if (thing === null)
		return null;

	if (type === 'string') {
		return String(thing).trim();
	} else if (type === 'number') {
		return Number(thing);
	} else if (type === 'boolean') {
		if (typeof(thing) === 'boolean')
			return thing;
		else if (typeof(thing) === 'string')
			return thing === 'true';
		else Boolean(thing);
	} else return undefined;
}

function sanitizeBag(bag, schema) {
	const sanitizedBag = {};

	for (let key of Object.keys(schema))
		sanitizedBag[key] = sanitize(bag[key], schema[key]);

	return sanitizedBag;
}

function isInt(value) {
	let x;
	if (isNaN(value))
		return false;
	x = parseFloat(value);
	return (x | 0) === x;
}

function isURL(url) {
	try {
		const obj = new URL(url);
		if (!obj.protocol.startsWith('http') && !obj.protocol.startsWith('https'))
			return false;
		return true;
	} catch (e) {
		return false;
	}
}

function median(array) {
	array = array.sort((a, b) => a - b);
	if (array.length % 2 === 0) // even
		return (array[array.length/2] + array[(array.length / 2) - 1]) / 2;
	else
		return array[(array.length - 1) / 2]; // odd
}

module.exports = {
	isCrawler,
	isGoogleBot,
	isBingBot,
	isDdgBot,
	getIP,
	attachBotStats,
	attachBotUpvotes,
	shorten,
	formatNumber,
	checkDBLock,
	getAvatar,
	generateRandomString,
	sanitize,
	sanitizeBag,
	isInt,
	isURL,
	median,
};