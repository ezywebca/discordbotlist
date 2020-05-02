const logger = require('./logger');
const bluebird = require('bluebird');
const redis = require('redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASSWORD
});

/* istanbul ignore next */
client.on('error', e => {
	logger.err(`Redis error: ${e.toString()}`);
});

module.exports = client;