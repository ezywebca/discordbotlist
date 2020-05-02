'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const botTag = sequelize.define('botTag', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		bot_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},
		tag_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
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
	});

	botTag.associate = models => {
		botTag.belongsTo(models.bot);
		botTag.belongsTo(models.tag);
	};

	return botTag;
};
