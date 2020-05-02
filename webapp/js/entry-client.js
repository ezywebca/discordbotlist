import { createApp } from './app';
import root from 'window-or-global';
import { getCookie, urlB64ToUint8Array } from './helpers';

const {
	app,
	router,
	store
} = createApp();

const authCookie = getCookie('auth');
const dataSaverCookie = getCookie('data-saver');

if (authCookie) {
	try {
		const auth = JSON.parse(authCookie);

		if (auth.token && auth.obtainedAt + auth.expiresIn > Date.now()) {
			if (!auth.roles)
				auth.roles = [];

			store.commit('auth/LOGIN', auth);
			root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
		} else {
			document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
			delete root.axios.defaults.headers.common['Authorization'];
		}
	} catch (e) {
		console.error('Invalid auth cookie!');
	}
}

if (dataSaverCookie == '1')
	store.dispatch('preferences/toggleDataSaver', true);

router.onReady(() => {
	router.beforeResolve((to, from, next) => {
		const matched = router.getMatchedComponents(to);
		const prevMatched = router.getMatchedComponents(from);

		let diffed = false;
		const activated = matched.filter((c, i) => {
			return diffed || (diffed = (prevMatched[i] !== c));
		});

		if (!activated.length) {
			return next();
		}
		Promise.all(activated.map(c => {
			if (c.asyncData) {
				return c.asyncData(store, to);
			}
		})).then(() => {
			next();
		}).catch(next);
	});

	app.$mount('#app');
});

require('pace-progress').start();

navigator.serviceWorker.register('/sw.js').then(async swReg => {
	const applicationServerKey = urlB64ToUint8Array(process.env.VAPID_PUBLIC);

	const subscribe = async () => {
		const options = {
			userVisibleOnly: true,
			applicationServerKey,
		};

		const subscription = await swReg.pushManager.subscribe(options);
		const json = subscription.toJSON();

		axios.post('/api/push-subscriptions', {
			endpoint: json.endpoint,
			p256dh: json.keys.p256dh,
			auth: json.keys.auth,
		});
	};

	if (store.getters['auth/isAuthenticated']) {
		const existingSubscription = await swReg.pushManager.getSubscription();

		if (!existingSubscription) {
			await subscribe();
		} else {
			const usedKey = new Uint8Array(existingSubscription.options.applicationServerKey).join(',');
			const currentKey = applicationServerKey.join(',');

			if (usedKey !== currentKey) {
				await existingSubscription.unsubscribe();
				await subscribe();
			}

		}
	}
}).catch(console.error);
