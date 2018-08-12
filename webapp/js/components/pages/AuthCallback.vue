<template>
	<div class="container">
		<h4>{{status}}</h4>
	</div>
</template>

<script>
	import {getURLParameter, extractError} from '../../helpers';

	export default {
		data: function() {
			return {
				status: 'Contacting Discord…',
			};
		},

		mounted: function() {
			const code = getURLParameter('code');
			const state = getURLParameter('state');
			
			console.log(`State ${state}`);

			if (code) {
				const originalState = localStorage.getItem('discord_oauth_state');
				console.log(`Original state ${originalState}`);

				if (!originalState || originalState !== state) {
					console.log(`State mismatch ${originalState} !== ${state}`);
					this.status = 'State mismatch error.';
				} else {
					localStorage.removeItem('discord_oauth_state');

					this.$store.dispatch('auth/login', code)
						.then(() => {
							this.$router.push({name: 'home'});
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
				{property: 'og:title', content: 'Completing Authentication / Discord Bot List'},
				{property: 'og:description', content: 'Who is linkng to this page? Please report.'},
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>
