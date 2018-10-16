'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.addColumn(
				'bots',
				'nsfw', {
					type: Sequelize.BOOLEAN,
					allowNull: false,
					defaultValue: false,
					after: 'verified',
				},
			),
		]);
	},

	down: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.removeColumn('bots', 'nsfw'),
		]);
	}
};
