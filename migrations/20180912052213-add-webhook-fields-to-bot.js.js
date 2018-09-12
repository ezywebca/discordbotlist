'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.addColumn(
				'bots',
				'webhook_url', {
					type: Sequelize.STRING(191),
					allowNull: true,
				}
			),
			queryInterface.addColumn(
				'bots',
				'webhook_secret', {
					type: Sequelize.STRING(191),
					allowNull: true,
				}
			),
		]);
	},

	down: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.removeColumn('bots', 'webhook_url'),
			queryInterface.removeColumn('bots', 'webhook_secret'),
		]);
	}
};
