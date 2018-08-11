<template>
	<div class="container text-center">
		<img :src="`https://cdn.discordapp.com/avatars/${bot.client_id}/${bot.avatar}.png?size=512`" class="bot-image center-block">
		<h2 class="mt-3">
			<strong>{{bot.username}}</strong>
			<span class="text-muted">#{{bot.discriminator}}</span>
		</h2>
		<button class="btn btn-primary btn-lg mt-4" :disabled="bot.is_upvoted" @click="upvote">
			Upvote{{bot.is_upvoted ? 'd' : ''}} ({{bot.upvotes}})
		</button>
		<router-link :to="{name: 'view-bot', params: {id: bot.client_id}}" class="mt-3" id="view-bot-link">
			See bot profile
		</router-link>
		<p v-if="bot.is_upvoted" class="text-muted mt-4">You can upvote every 12 hours :)</p>
	</div>
</template>

<style scoped>
	.bot-image {
		width: 100%;
		max-width: 280px;
		border-radius: 5px;
	}

	#view-bot-link {
		display: block;
	}
</style>


<script>
	import {mapGetters, mapState} from 'vuex';
	import {extractError, generateRandomString} from '../../helpers';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('bots/fetch', {id: route.params.id});
		},

		methods: {
			upvote: function() {
				if (!this.isAuthenticated) {
					const state = generateRandomString(32);
					localStorage.setItem('discord_oauth_state', state);
					window.location = this.discordOAuthURL + '&state=' + state;
				} else {
					axios.post(`/api/bots/${this.$route.params.id}/upvotes`).then(response => {
						this.$store.dispatch('bots/upvote', {clientId: this.$route.params.id});
					}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},
		},

		computed: {
			...mapState('auth', {
				discordOAuthURL: state => state.discordOAuthURL,
				currentUserId: state => state.id,

			}),
			...mapGetters({
				getBotById: 'bots/getBotById',
				isAuthenticated: 'auth/isAuthenticated'
			}),

			bot: function() {
				return this.getBotById(this.$route.params.id);
			}
		},

		meta: function() {
			return {
				title: `Vote for ${this.bot.username}` || 'Vote for a bot',

				meta: [
					{name: 'og:image', content: `https://cdn.discordapp.com/avatars/${this.bot.client_id}/${this.bot.avatar}.png?size=512`, vmid: 'og:image'},
					{name: 'description', content: this.bot.short_description || 'Vote for a bot on PurpleBots'},
					{property: 'og:title', content: (`Vote for ${this.bot.username}` || 'Vote for a bot') + ' / PurpleBots'},
					{property: 'og:description', content: this.bot.short_description || 'Vote for a bot on PurpleBots'},
				],
			};
		},
	};
</script>
