/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

import root from 'window-or-global';
import {createApp} from './app';

module.exports = context => {
	root.location = {
		protocol: context.protocol + ':',
		hostname: context.hostname,
	};

	root.serverRendering = true;
	root.apiHost = context.apiHost;

	return new Promise(async (resolve, reject) => {
		const {app, router, store} = createApp();

		store.commit('auth/SET_DISCORD_OAUTH_URL', {
			discordId: context.discordId,
			discordRedirect: context.discordRedirect
		});

		if (context.authCookie) {
			try {
				const auth = JSON.parse(context.authCookie);
				if (auth.obtainedAt + auth.expiresIn > Date.now()) {
					if (!auth.roles)
						auth.roles = [];
						
					root.document = {
						cookie: `auth=${context.authCookie}`
					};
					store.commit('auth/LOGIN', auth);
					root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
				}
			} catch (e) {
				console.log('Invalid auth cookie passed to SSR');
			}
		}

		if (context.dataSaverCookie === '1')
			store.dispatch('preferences/toggleDataSaver', true);

		const {url} = context;
		const {fullPath} = router.resolve(url).route;

		if (fullPath !== url)
			return reject({
				url: fullPath
			});

		router.push(url);

		context.meta = app.$meta();

		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();
			if (!matchedComponents.length)
				return reject({
					code: 404
				});
			Promise.all(matchedComponents.map(({
				asyncData
			}) => asyncData && asyncData(
				store,
				router.currentRoute
			))).then(() => {
				context.state = store.state;
				resolve(app);
			}).catch(reject);
		}, reject);
	});
};
