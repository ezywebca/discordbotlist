/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const user = sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		discord_id: {
			type: DataTypes.STRING(32),
			allowNull: false,
			unique: true
		},
		username: {
			type: DataTypes.STRING(32),
			allowNull: false,
		},
		discriminator: {
			type: DataTypes.STRING(4),
			allowNull: false,
		},
		avatar: {
			type: DataTypes.STRING(128),
			allowNull: true,
		},
		banned: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		admin: {
			type: DataTypes.BOOLEAN,
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

	user.associate = models => {
		user.hasMany(models.bot, {foreignKey: 'owner_id'});
	};

	user.transform = user => {
		const result = {
			id: user.discord_id,
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
			admin: user.admin,
			banned: user.banned,
			created_at: user.created_at
		};

		if (user.bots)
			result.bots = user.bots.map(sequelize.models.bot.transform);

		return result;
	};

	return user;
};
