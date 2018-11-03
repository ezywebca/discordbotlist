/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

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
