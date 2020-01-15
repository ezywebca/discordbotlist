/* Copyright (C) 2020 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const redis = require('../redis');
const Queue = require('bee-queue');
const logger = require('../logger');
const webPush = require('../web-push');

const queue = new Queue('push-notifications', {
	redis,
	activateDelayedJobs: true,
});

queue.process(4, async job => {
	const bot = job.data.bot;
	const user = job.data.user;

	if (!(await webPush.isUserSubscribed(user.id))) {
		logger.warn(`Push notifications (Job #${job.id}) not processed for user '${user.username}#${user.discriminator}'`
			+ ` (ID: ${user.id}) to upvote '${bot.username}#${bot.discriminator}' (ID: ${bot.id}) due to inexistent subscription`);
		return;
	}

	const avatar = bot.avatar
		? `https://cdn.discordapp.com/avatars/${bot.bot_id}/${bot.avatar}.png?size=128`
		: `https://cdn.discordapp.com/embed/avatars/${bot.discriminator % 5}.png`;

	await webPush.sendUser(user.id, JSON.stringify({
		bot: {
			id: bot.bot_id,
			username: bot.username,
			avatar_url: avatar,
		},
	}));
});

queue.on('succeeded', (job, result) => {
	logger.info(`Push notifications delivery (Job #${job.id}) succeeded.`);
});

queue.on('job retrying', (id, err) => {
	logger.warn(`Push notifications delivery (Job #${id}) failed. Retrying... ${err.message}`);
});

queue.on('job failed', (id, err) => {
	logger.warn(`Push notifications delivery (Job #${id}) failed after 5 attempts: ${err.message}`);
});

module.exports = queue;