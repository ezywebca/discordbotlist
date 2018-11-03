/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

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
