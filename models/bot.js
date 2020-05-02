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
		bot_id: {
			type: DataTypes.STRING(32),
			allowNull: false,
			unique: true,
		},
		client_id: {
			type: DataTypes.STRING(32),
			allowNull: true,
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
		webhook_url: {
			type: DataTypes.STRING(191),
			allowNull: true,
		},
		webhook_secret: {
			type: DataTypes.STRING(191),
			allowNull: true,
		},
		verified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		nsfw: {
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
		bot.belongsToMany(models.tag, {through: models.botTag});
	};

	bot.transform = (bot, options) => {
		const result = {
			id: bot.bot_id,
			client_id: bot.client_id,
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
			nsfw: !!bot.nsfw,
			upvotes: bot.upvotes,
			upvote_lock: bot.upvote_lock,
			is_upvoted: bot.is_upvoted,
			created_at: bot.created_at,
			updated_at: bot.updated_at,


			...options.includeWebhooks ? {
				webhook_url: bot.webhook_url,
				webhook_secret: bot.webhook_secret,
			} : {},
		};

		if (bot.user)
			result.owner = sequelize.models.user.transform(bot.user);

		if (bot.stats)
			result.stats = bot.stats;

		if (bot.tags)
			result.tags = bot.tags.map(sequelize.models.tag.transform);

		if (typeof bot.in_testing_guild === 'boolean')
			result.in_testing_guild = bot.in_testing_guild;

		return result;
	};

	return bot;
};
