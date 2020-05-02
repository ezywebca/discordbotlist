'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const pushSubscription = sequelize.define('pushSubscription', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		endpoint: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		p256dh: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		auth: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		deleted_at: {
			type: TIMESTAMP,
			defaultValue: null,
			allowNull: true,
		},
		created_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
		updated_at: {
			type: TIMESTAMP,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
	}, {
		paranoid: true,
	});

	pushSubscription.associate = models => {
		pushSubscription.belongsTo(models.user);
	};

	return pushSubscription;
};
