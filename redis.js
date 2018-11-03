/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

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