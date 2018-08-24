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

	isInvited: id => {
		return !!bot.guilds.get(process.env.GUILD_ID).members.some(member => member.id === id);
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
			.send(embed);
	},
};