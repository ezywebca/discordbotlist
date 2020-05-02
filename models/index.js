'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

const config = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: process.env.DB_DIALECT,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,

	timezone: process.env.TIMEZONE || '+00:00',

	operatorsAliases: false,

	define: {
		underscored: true,
		underscoredAll: true,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
	},

	logging: false,

	pool: {
		max: 5,
		min: 0,
		idle: 20000,
		acquire: 20000,
	},
};

const db = {};

let sequelize;

/* istanbul ignore next */
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}

/* istanbul ignore next */
fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		const model = sequelize['import'](path.join(__dirname, file));
		db[model.name] = model;
	});

/* istanbul ignore next */
Object.keys(db).forEach(modelName => {
	if (db[modelName].associate)
		db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
