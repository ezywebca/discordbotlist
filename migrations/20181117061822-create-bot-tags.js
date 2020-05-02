'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		const TIMESTAMP = require('sequelize-mysql-timestamp')(queryInterface.sequelize);

		return queryInterface.createTable('bot_tags', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			bot_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
			},
			tag_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
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
			indexes: [{
				unique: true,
				fields: ['bot_id', 'tag_id'],
			}],
			charset: 'utf8mb4',
			collate: 'utf8mb4_unicode_ci'
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('bot_tags');
	}
};