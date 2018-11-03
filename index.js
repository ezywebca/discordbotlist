/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const logger = require('./logger');
const api = require('./api-server');
const app = require('./webapp-server');

const apiPort = process.env.API_PORT || 3000;
const webPort = process.env.WEBAPP_PORT || 3001;

api.listen(apiPort);
logger.info(`API listening on port ${apiPort}`);

app.listen(webPort);
logger.info(`Web app server listening on port ${webPort}`);
