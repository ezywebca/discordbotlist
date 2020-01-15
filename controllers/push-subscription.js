/* Copyright (C) 2020 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const models = require('../models');
const {sanitizeBag} = require('../helpers');
const serviceBot = require('../bot');

module.exports = {
	async subscribe(ctx) {
		const {
			endpoint,
			p256dh,
			auth,
		} = sanitizeBag(ctx.request.body, {
			name: 'string',
			endpoint: 'string',
			p256dh: 'string',
			auth: 'string',
		});

		if (!endpoint)
			throw {status: 422, message: 'The endpoint is missing'};
		else if (!p256dh)
			throw {status: 422, message: 'The p256dh is missing'};
		else if (!auth)
			throw {status: 422, message: 'The auth is missing'};

		await models.pushSubscription.create({
			user_id: ctx.state.user.id,
			endpoint,
			p256dh,
			auth,
		});

		serviceBot.sendToModerators('new subscriber WOOO!!!!!!!!');

		ctx.status = 204;
	},
};
