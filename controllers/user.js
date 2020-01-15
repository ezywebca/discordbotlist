/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const models = require('../models');
const { attachBotStats, sanitize } = require('../helpers');
const redis = require('../redis');

module.exports = {
	get: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: sanitize(ctx.params.id, 'string'),
			},
			include: [models.bot]
		});

		if (!user)
			throw {status: 404, message: 'Not found'};

		user.bots = await Promise.all(user.bots.map(async bot => {
			const upvotes = await redis.keysAsync(`bots:${bot.id}:upvotes:*`);
			bot.is_upvoted = !!ctx.state.user && upvotes.includes(`bots:${bot.id}:upvotes:${ctx.state.user.id}`);
			bot.upvotes = upvotes.length;
			await attachBotStats(bot);
			return bot;
		}));

		ctx.body = models.user.transform(user);
	},

	ban: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: sanitize(ctx.params.id, 'string'),
			}
		});

		if (!user)
			throw {status: 404, message: 'Not found'};

		if (user.admin)
			throw {status: 403, message: 'You can\'t ban an admin'};

		user.banned = true;
		await user.save();

		ctx.status = 204;
	},

	unban: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: sanitize(ctx.params.id, 'string'),
			}
		});

		if (!user)
			throw {status: 404, message: 'Not found'};
		if (user.admin)
			throw {status: 403, message: 'You can\'t unban an admin'};

		user.banned = false;
		await user.save();

		ctx.status = 204;
	},

	refresh: async (ctx, next) => {
		const user = await models.user.findOne({
			where: {
				discord_id: sanitize(ctx.params.id, 'string'),
			}
		});

		if (!user)
			throw {status: 404, message: 'Not found'};

		ctx.status = 204;
	},
};
