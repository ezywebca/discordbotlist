'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('tags', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			name: {
				type: Sequelize.STRING(32),
				allowNull: false,
				unique: true
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
			charset: 'utf8mb4',
			collate: 'utf8mb4_unicode_ci'
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('tags');
	}
};