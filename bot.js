const Discord = require('discord.js');
const logger = require('./logger');

const bot = new Discord.Client();
let discordLoggingDisabled = false;

bot.login(process.env.BOT_TOKEN);

bot.on('ready', () => {
	logger.info('Bot is connected!');
});


module.exports = {
	isOnline: id => {
		return bot.guilds.some(guild => {
			const member = guild.members.find(member => member.id === id);
			if (member)
				return member.presence.status !== 'offline';
		});
	},

	isInGuild: id => {
		return !!bot.guilds.get(process.env.GUILD_ID).members.some(member => member.id === id);
	},

	ensureDevRole: async id => {
		if (!process.env.BOT_DEV_ROLE_ID)
			return logger.warn('Bot Developer role ID is not set; ignoring the whole thing');
		const member = bot.guilds.get(process.env.GUILD_ID).members.get(id);

		if (!member)
			return logger.warn(`Unable to ensure Bot Developer role for non-existing user: ${id}`);
		
		if (!member.roles.get(process.env.BOT_DEV_ROLE_ID))
			return member.addRole(process.env.BOT_DEV_ROLE_ID, 'User has a bot on website').catch(e => {
				logger.warn(`Can't set Bot Developer role for user: ${id}`);
				logger.warn(e);	
			});
	},

	ensureWithoutDevRole: async id => {
		if (!process.env.BOT_DEV_ROLE_ID)
			return logger.warn('Bot Developer role ID is not set; ignoring the whole thing');
		const member = bot.guilds.get(process.env.GUILD_ID).members.get(id);

		if (!member)
			return logger.warn(`Unable to ensure not having Bot Developer role for non-existing user: ${id}`);

		if (member.roles.get(process.env.BOT_DEV_ROLE_ID))
			return member.removeRole(process.env.BOT_DEV_ROLE_ID, 'User no longer has a bot on website').catch(e => {
				logger.err(`Can't remove Bot Developer role for user: ${id}`);
				logger.err(e);
			});
	},

	log: ({title, description, color, url, image}) => {
		if (discordLoggingDisabled)
			return;

		if (!process.env.GUILD_ID || !process.env.LOGGING_CHANNEL_ID) {
			logger.warn('Logging to Discord is unconfigured; thus disabled');
			discordLoggingDisabled = true;
			return;
		}

		const embed = new Discord.RichEmbed();

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
	},
};