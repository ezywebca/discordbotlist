const {checkDBLock} = require('../helpers');
const adminOnly = require('./admin-only');

module.exports = async (ctx, next) => {
	try {
		await checkDBLock();
	} catch (dbLockedError) {
		try {
			await adminOnly(ctx, () => {});
		} catch (e) {
			throw dbLockedError;
		}
	}

	return next();
};
