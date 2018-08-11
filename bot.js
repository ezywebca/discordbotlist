const Discord = require('discord.js');
const logger = require('./logger');

const bot = new Discord.Client();

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
	}
};