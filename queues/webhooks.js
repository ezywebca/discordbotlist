const redis = require('../redis');
const Queue = require('bee-queue');
const logger = require('../logger');
const request = require('request-promise-native');
const models = require('../models');

const shttps = require('socks5-https-client/lib/Agent');
const shttp = require('socks5-http-client/lib/Agent');

const queue = new Queue('webhooks', {
	redis,
	activateDelayedJobs: true,
});

queue.process(4, async job => {
	const agent = job.data.url.startsWith('https://') ? shttps : shttp;

	return request.post(job.data.url, {
		headers: {
			'X-DBL-Signature': `${job.data.secret} ${Date.now()}`,
		},

		form: models.user.transform(job.data.user),
		agentClass: agent,

		agentOptions: {
			socksHost: process.env.SOCKS5_HOST,
			socksPort: process.env.SOCKS5_PORT,
			socksUsername: process.env.SOCKS5_USER,
			socksPassword: process.env.SOCKS5_PASS,
		}
	});
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