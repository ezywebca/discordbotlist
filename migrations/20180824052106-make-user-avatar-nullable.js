'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn(
			'users',
			'avatar', {
				type: Sequelize.STRING(128),
				allowNull: true,
			}
		);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn(
			'users',
			'avatar', {
				type: Sequelize.STRING(128),
				allowNull: false,
			}
		);
	}
};
