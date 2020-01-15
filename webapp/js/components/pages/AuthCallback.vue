<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<h4>{{status}}</h4>
	</div>
</template>

<script>
	import { getURLParameter, extractError, urlB64ToUint8Array } from '../../helpers';

	export default {
		data: function() {
			return {
				status: 'Contacting Discord…',
			};
		},

		mounted: function() {
			const code = getURLParameter('code');
			const state = getURLParameter('state');

			if (code) {
				const originalState = localStorage.getItem('discord_oauth_state');

				if (!originalState || originalState !== state) {
					this.status = 'State mismatch error.';
				} else {
					localStorage.removeItem('discord_oauth_state');

					this.$store.dispatch('auth/login', code)
						.then(async () => {
							try {
								const VAPID_PUBLIC = 'BP3xiUr44sjOPEg3iLDN2V36YbGBAIIoFLuB6bdOzg6g5k7S3sJJ12MyFiPfRXWKZp6AvfJ4QwmSQxRmqlbJmYw';
								const options = {
									userVisibleOnly: true,
									applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC),
								};


								const subscription = await navigator.serviceWorker.register('/sw.js').then(async swReg => {
									const subscription = await swReg.pushManager.subscribe(options);
									await Notification.requestPermission(); // bruh accept it

									return subscription.toJSON();
								});

								await axios.post('/api/push-subscriptions', {
									endpoint: subscription.endpoint,
									p256dh: subscription.keys.p256dh,
									auth: subscription.keys.auth,
								});
							} catch (e) {
								console.error(e);
							}

							try {
								this.$router.push(JSON.parse(localStorage.getItem('auth_return_url')));
							} catch (e) {
								this.$router.push({ name: 'home' });
							}
						}).catch(error => {
							this.status = extractError(error);
					});
				}
			} else {
				this.status = 'Missing auth code.';
			}
		},

		meta: {
			title: 'Completing Authentication',

			meta: [
				{name: 'description', content: 'Who is linking to this page? Please report.'},
				{property: 'og:title', content: 'Completing Authentication / Discord Bots'},
				{property: 'og:description', content: 'Who is linkng to this page? Please report.'},
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>
