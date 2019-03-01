/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const models = require('../models');
const {sanitizeBag, attachBotUpvotes, attachBotStats, isInt} = require('../helpers');
const serviceBot = require('../bot');

module.exports = {
	getAll: async ctx => {
		ctx.body = (await models.tag.findAll()).map(models.tag.transform);
	},

	get: async ctx => {
		const tag = await models.tag.findOne({
			where: {name: ctx.params.name},
		});

		if (!tag)
			throw {status: 404, message: 'Not found'};
		
		ctx.body = models.tag.transform(tag);
	},

	create: async ctx => {
		const {
			name,
		} = sanitizeBag(ctx.request.body, {
			name: 'string',
		});

		if (!name)
			throw {status: 422, message: 'Tag name is missing'};
		else if (name.length > 32)
			throw {status: 422, message: 'Tag name is missing'};
		else if (await models.tag.find({where: {name}}))
			throw {status: 409, message: 'Tag exists'};

		const tag = await models.tag.create({
			name
		});

		// Doing an extra SELECT because Sequelize doesn't populate created_at and updated_at
		// Upon model creation.
		
		ctx.body = models.tag.transform(await models.tag.find({where: {id: tag.id}}));
	},

	delete: async ctx => {
		const tag = await models.tag.findOne({
			where: {
				name: ctx.params.name,
			},
		});

		if (!tag)
			throw {status: 404, message: 'Not found'};

		await tag.destroy();

		ctx.status = 204;
	},

	getBots: async ctx => {
		if (ctx.query.skip && (!isInt(ctx.query.skip) || ctx.query.skip < 0))
			throw {status: 404, message: '\'skip\' parameter must be a number'};

		const skip = parseInt(ctx.query.skip) || 0;

		const tag = await models.tag.findOne({
			where: {name: ctx.params.name},
			limit: skip + 20,
			include: [models.bot],
		});

		if (!tag)
			throw {status: 404, message: 'Not found'};

		let bots = await Promise.all(tag.bots.slice(skip, skip + 20).map(async bot => {
			await attachBotUpvotes(bot, ctx.state.user);
			await attachBotStats(bot);
			return models.bot.transform(bot, {includeWebhooks: ctx.state.user ? (ctx.state.user.id === bot.owner_id || ctx.state.user.admin) : false});
		}));

		bots = bots.filter(bot => !bot.nsfw && serviceBot.isInGuild(bot.id));

		ctx.body = bots.sort((a, b) => b.upvotes - a.upvotes);
	}
};
