const logger = require('./logger');
const api = require('./api-server');
const app = require('./webapp-server');

const apiPort = process.env.API_PORT || 3000;
const webPort = process.env.WEBAPP_PORT || 3001;

api.listen(apiPort);
logger.info(`API listening on port ${apiPort}`);

app.listen(webPort);
logger.info(`Web app server listening on port ${webPort}`);
