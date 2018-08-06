const logger = require('./logger');
const bluebird = require('bluebird');
const redis = require('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
});

/* istanbul ignore next */
client.on('error', e => {
	logger.err(`Redis error: ${e.toString()}`);
});

/* istanbul ignore next */
if (process.env.REDIS_PASSWORD)
	client.auth(process.env.REDIS_PASSWORD);

module.exports = client;