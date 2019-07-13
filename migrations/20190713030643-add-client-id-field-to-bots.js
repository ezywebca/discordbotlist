'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn(
			'bots',
			'client_id', {
				type: Sequelize.STRING(32),
				allowNull: false,
				after: 'bot_id',
				defaultValue: '',
			},
		);

		await queryInterface.bulkUpdate('bots', {
			client_id: Sequelize.literal('bot_id'),
		});

		await queryInterface.addConstraint('bots', ['client_id'], {
			type: 'unique',
			name: 'client_id',
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('bots', 'client_id');
		await queryInterface.removeColumn('bots', 'client_id');
	}
};
