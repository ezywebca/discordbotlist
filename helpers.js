const dns = require('dns');
const logger = require('./logger');
const serviceBot = require('./bot');
const redis = require('./redis');
const axios = require('axios');

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
		online: serviceBot.isOnline(bot.discord_id),
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

async function refreshBot(bot, force = false) {
	try {
		const cacheKey = `bots:${bot.id}:fresh`;

		if (force || (!force && !(await redis.getAsync(cacheKey)))) {
			const newBotInfo = await axios.get('https://discordapp.com/api/v6/users/' + encodeURIComponent(bot.discord_id), {
				headers: {
					'Authorization': `Bot ${process.env.BOT_TOKEN}`,
				},
			}).then(response => response.data);

			bot.username = newBotInfo.username;
			bot.discriminator = newBotInfo.discriminator;
			bot.avatar = newBotInfo.avatar;

			bot.changed('updated_at', true); // Because users need to know our info is up to date! ha!

			await bot.save();
			await bot.reload(); // Because Sequelize is too dumb to replace CURRENT_TIMESTAMP with the actual current timestamp after save
			await redis.setAsync(cacheKey, 1, 'EX', 15 * 60);

			logger.info(`Refreshed bot: ${bot.discord_id}`);
		}
	} catch (e) {
		if (e.response && e.response.status === 404)
			await bot.destroy();
			
		logger.warn(`Could not refresh bot: ${bot.discord_id}`);
		logger.warn(e);
	}

	return bot;
}


async function refreshUser(user, force = false) {
	try {
		const cacheKey = `user:${user.id}:fresh`;

		if (force || (!force && !(await redis.getAsync(cacheKey)))) {
			const newUserInfo = await axios.get('https://discordapp.com/api/v6/users/' + encodeURIComponent(user.discord_id), {
				headers: {
					'Authorization': `Bot ${process.env.BOT_TOKEN}`,
				},
			}).then(response => response.data);

			user.username = newUserInfo.username;
			user.discriminator = newUserInfo.discriminator;
			user.avatar = newUserInfo.avatar;

			user.changed('updated_at', true); // Because users need to know our info is up to date! ha!

			await user.save();
			await user.reload(); // Because Sequelize is too dumb to replace CURRENT_TIMESTAMP with the actual current timestamp after save
			await redis.setAsync(cacheKey, 1, 'EX', 15 * 60);

			logger.info(`Refreshed user: ${user.discord_id}`);
		}
	} catch (e) {
		logger.warn(`Could not refresh user: ${user.discord_id}`);
		logger.warn(e);
	}

	return user;
}

// https://codebottle.io/s/2a5e5efd87
function shorten(str, len, ellipsis = '…') {
	if (str.length <= len)
		return str;

	var result = str.substr(0, len - 1);
	result = result.substr(0, Math.min(result.length, result.lastIndexOf(' ')));

	return result + ellipsis;
}

// https://stackoverflow.com/a/9461657/2164304
function kFormatter(num) {
	return num > 999 ? (num / 1000).toFixed(1) + 'k' : num
}

module.exports = {
	isCrawler,
	isGoogleBot,
	isBingBot,
	isDdgBot,
	getIP,
	refreshBot,
	refreshUser,
	attachBotStats,
	shorten,
	kFormatter,
};