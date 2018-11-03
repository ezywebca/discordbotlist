/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);

/* istanbul ignore next */
var env = process.env.NODE_ENV || 'development';
var config = {
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
};
var db = {};

var sequelize = null;

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
		var model = sequelize['import'](path.join(__dirname, file));
		db[model.name] = model;
	});

/* istanbul ignore next */
Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
