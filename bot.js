/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const Discord = require('discord.js');
const logger = require('./logger');
const models = require('./models');

const bot = new Discord.Client({
	fetchAllMembers: true,
});

let discordLoggingDisabled = false;

bot.login(process.env.BOT_TOKEN);

bot.on('ready', () => {
	logger.info('Bot is connected!');
});

bot.on('userUpdate', async (oldUser, newUser) => {
	const bot = oldUser.bot || newUser.bot;

	let entity;

	if (bot)
		entity = await models.bot.findOne({
			where: {bot_id: oldUser.id},
		});
	else
		entity = await models.user.findOne({
			where: {discord_id: oldUser.id},
		});

	if (!entity)
		return logger.warn(`Error refreshing non-existant bot/user ${oldUser.id}`);

	entity.username = newUser.username;
	entity.discriminator = newUser.discriminator;
	entity.avatar = newUser.avatar;
	await entity.save();

	logger.info(`Refreshed ${bot ? 'bot' : 'user'}: ${oldUser.id}`);
});

bot.on('guildMemberRemove', async member => {
	if (!member.user.bot) {
		const owner = await models.user.findOne({
			where: { discord_id: member.user.id },
		});

		const bots = await models.bot.findAll({
			where: { owner_id: owner.id },
		});

		if (bots.length > 0) {
			let message = 'The following user left server: ';

			message += `**${member.user.tag}** (ID: **${member.user.id}**)\n\n`;
			message += 'The following bots should be removed:\n';

			for (const bot of bots)
				message += `**${bot.username}#${bot.discriminator}** (ID: **${bot.bot_id}**) (<@${bot.bot_id}>) (https://discordbotlist.com/bots/${bot.bot_id})\n`;

			await bot.guilds.get(process.env.GUILD_ID)
				.channels.get(process.env.MODERATORS_CHANNEL_ID)
				.send(message);
		}
	}
});

module.exports.isOnline = (id) => {
	return bot.guilds.some(guild => {
		const member = guild.members.find(member => member.id === id);
		if (member)
			return member.presence.status !== 'offline';
	});
},

module.exports.isInGuild = (id) => {
	return !!bot.guilds.get(process.env.GUILD_ID).members.some(member => member.id === id);
},

module.exports.isInTestingGuild = (id) => {
	return !!bot.guilds.get(process.env.TESTING_GUILD_ID).members.some(member => member.id === id);
},

module.exports.hasRole = (memberId, roleId) => {
	const member = bot.guilds.get(process.env.GUILD_ID).members.get(memberId);

	return member && member.roles.has(roleId);
},

module.exports.ensureDevRole = async (id) => {
	if (!process.env.BOT_DEV_ROLE_ID)
		return logger.warn('Bot Developer role ID is not set; ignoring the whole thing');
	const member = bot.guilds.get(process.env.GUILD_ID).members.get(id);

	if (!member)
		return logger.warn(`Unable to ensure Bot Developer role for non-existing user: ${id}`);

	if (!member.roles.get(process.env.BOT_DEV_ROLE_ID))
		return member.roles.add(process.env.BOT_DEV_ROLE_ID, 'User has a bot on website').catch(e => {
			logger.warn(`Can't set Bot Developer role for user: ${id}`);
			logger.warn(e);
		});
},

module.exports.ensureWithoutDevRole = async (id) => {
	if (!process.env.BOT_DEV_ROLE_ID)
		return logger.warn('Bot Developer role ID is not set; ignoring the whole thing');
	const member = bot.guilds.get(process.env.GUILD_ID).members.get(id);

	if (!member)
		return logger.warn(`Unable to ensure not having Bot Developer role for non-existing user: ${id}`);

	if (member.roles.get(process.env.BOT_DEV_ROLE_ID))
		return member.roles.remove(process.env.BOT_DEV_ROLE_ID, 'User no longer has a bot on website').catch(e => {
			logger.err(`Can't remove Bot Developer role for user: ${id}`);
			logger.err(e);
		});
},

module.exports.log = ({title, description, color, url, image}) => {
	if (discordLoggingDisabled)
		return;

	if (!process.env.GUILD_ID || !process.env.LOGGING_CHANNEL_ID) {
		logger.warn('Logging to Discord is unconfigured; thus disabled');
		discordLoggingDisabled = true;
		return;
	}

	const embed = new Discord.MessageEmbed();

	if (title)
		embed.setTitle(title);
	if (description)
		embed.setDescription(description);
	if (color)
		embed.setColor(color);
	if (url)
		embed.setURL(url);
	if (image)
		embed.setImage(image);

	embed.setTimestamp(Date.now());

	return bot.guilds.get(process.env.GUILD_ID).channels.get(process.env.LOGGING_CHANNEL_ID)
		.send(embed).catch(e => {
			logger.err('Cannot deliver log message to Discord');
		});
};

module.exports.sendToModerators = (stuff, ping = false) => {
	return bot.guilds.get(process.env.GUILD_ID).channels.get(process.env.MODERATORS_CHANNEL_ID)
		.send(`${ping ? `<@${process.env.MODERATORS_ROLE_ID}>\n` : ''}${stuff}`)
		.catch(e => {
			logger.err('Cannot deliver moderators notification to Discord');
		});
};

module.exports.kick = (id, reason) => {
	return bot.guilds.get(process.env.GUILD_ID).members.get(id).kick(reason)
		.catch(e => {
			logger.err(`Cannot kick member: ${e}`);
		});
};

module.exports.kickFromTesting = (id, reason) => {
	return bot.guilds.get(process.env.TESTING_GUILD_ID).members.get(id).kick(reason)
		.catch(e => {
			logger.err(`Cannot kick member from testing guild: ${e}`);
		});
};

module.exports.dm = (id, message) => {
	return bot.guilds.get(process.env.GUILD_ID).members.get(id).send(message).catch(e => {
		logger.err(`Could not deliver to user ${id} message '${message}' due to error: ${e}`);
	});
};
