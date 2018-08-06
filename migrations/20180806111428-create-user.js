'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('users', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			discord_id: {
				type: Sequelize.STRING(32),
				allowNull: false,
				unique: true
			},
			username: {
				type: Sequelize.STRING(32),
				allowNull: false
			},
			discriminator: {
				type: Sequelize.STRING(4),
				allowNull: false
			},
			avatar: {
				type: Sequelize.STRING(24),
				allowNull: false
			},
			email: {
				type: Sequelize.STRING(191),
				allowNull: false,
			},
			banned: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			admin: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false
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
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('users');
	}
};