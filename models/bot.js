'use strict';
module.exports = (sequelize, DataTypes) => {
	const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize);

	const bot = sequelize.define('bot', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		owner_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		},
		discord_id: {
			type: DataTypes.STRING(32),
			allowNull: false,
			unique: true,
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
		short_description: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		long_description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		prefix: {
			type: DataTypes.STRING(16),
			allowNull: true,
		},
		website: {
			type: DataTypes.STRING(191),
			allowNull: true,
		},
		bot_invite: {
			type: DataTypes.STRING(191),
			allowNull: false,
		},
		server_invite: {
			type: DataTypes.STRING(191),
			allowNull: true,
		},
		verified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
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

	bot.associate = models => {
		bot.belongsTo(models.user, {foreignKey: 'owner_id'});
	};

	bot.transform = bot => {
		const result = {
			id: bot.discord_id,
			username: bot.username,
			discriminator: bot.discriminator,
			avatar: bot.avatar,
			short_description: bot.short_description,
			long_description: bot.long_description,
			prefix: bot.prefix,
			website: bot.website,
			bot_invite: bot.bot_invite,
			server_invite: bot.server_invite,
			verified: !!bot.verified,
			upvotes: bot.upvotes,
			upvote_lock: bot.upvote_lock,
			is_upvoted: bot.is_upvoted,
			created_at: bot.created_at,
			updated_at: bot.updated_at,
		};

		if (bot.user)
			result.owner = sequelize.models.user.transform(bot.user);

		if (bot.stats)
			result.stats = bot.stats;

		return result;
	};

	return bot;
};
