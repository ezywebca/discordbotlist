module.exports = function DBLockedError() {
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
};

require('util').inherits(module.exports, Error);