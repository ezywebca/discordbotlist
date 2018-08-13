'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('bots', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			owner_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false
			},
			client_id: {
				type: Sequelize.STRING(32),
				allowNull: false,
				unique: true,
			},
			username: {
				type: Sequelize.STRING(32),
				allowNull: false,
			},
			discriminator: {
				type: Sequelize.STRING(4),
				allowNull: false,
			},
			avatar: {
				type: Sequelize.STRING(128),
				allowNull: false,
			},
			short_description: {
				type: Sequelize.STRING(191),
				allowNull: false,
			},
			long_description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			prefix: {
				type: Sequelize.STRING(16),
				allowNull: true,
			},
			website: {
				type: Sequelize.STRING(191),
				allowNull: true,
			},
			bot_invite: {
				type: Sequelize.STRING(191),
				allowNull: true,
			},
			server_invite: {
				type: Sequelize.STRING(191),
				allowNull: false,
			},
			deleted_at: {
				type: TIMESTAMP,
				defaultValue: null,
				allowNull: true,
			},
			created_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
			updated_at: {
				type: TIMESTAMP,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				allowNull: false
			},
		}, {
			charset: 'utf8',
			collate: 'utf8_unicode_ci'
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('bots');
	}
};