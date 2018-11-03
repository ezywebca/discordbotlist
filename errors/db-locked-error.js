/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

module.exports = function DBLockedError() {
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
};

require('util').inherits(module.exports, Error);