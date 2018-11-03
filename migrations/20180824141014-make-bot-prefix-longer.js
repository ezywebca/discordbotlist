/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

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
