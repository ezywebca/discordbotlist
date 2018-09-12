const redis = require('../redis');
const Queue = require('bee-queue');
const logger = require('../logger');
const axios = require('axios');
const models = require('../models');

const queue = new Queue('webhooks', {
	redis,
	activateDelayedJobs: true,
});

queue.process(4, async job => {
	logger.info(`Webhook delivery (Job #${job.id}) for '${job.data.bot.username}' (ID: ${job.data.bot.id}) scheduled.`);
	return axios.post(job.data.url, models.user.transform(job.data.user), {
		headers: {
			'X-DBL-Signature': `${job.data.secret} ${Date.now()}`,
		},
	}).then(() => {}); // bee-queue stringifies circular response for some reason, also don't need it.
});

queue.on('succeeded', (job, result) => {
	logger.info(`Webhook delivery (Job #${job.id}) succeeded.`);
});

queue.on('job retrying', (id, err) => {
	logger.warn(`Webhook delivery (Job #${id}) failed. Retrying... ${err.message}`);
});

queue.on('job failed', (id, err) => {
	logger.warn(`Webhook delivery (Job #${id}) failed after 5 attempts: ${err.message}`);
});

module.exports = queue;