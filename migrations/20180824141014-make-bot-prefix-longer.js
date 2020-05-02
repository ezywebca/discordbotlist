'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn(
			'bots',
			'prefix', {
				type: Sequelize.STRING(48),
				allowNull: true,
			}
		);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn(
			'bots',
			'prefix', {
				type: Sequelize.STRING(16),
				allowNull: true,
			}
		);
	}
};
