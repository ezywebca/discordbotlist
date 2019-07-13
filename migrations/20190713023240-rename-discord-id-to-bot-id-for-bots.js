'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('bots', 'discord_id');
		await queryInterface.renameColumn('bots', 'discord_id', 'bot_id');
		await queryInterface.addConstraint('bots', ['bot_id'], {
			type: 'unique',
			name: 'bot_id',
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('bots', 'bot_id');
		await queryInterface.renameColumn('bots', 'bot_id', 'discord_id');
		await queryInterface.addConstraint('bots', ['discord_id'], {
			type: 'unique',
			name: 'discord_id',
		});
	}
};
