<template>
	<div class="container text-center">
		<img :src="getAvatar(bot)" class="bot-image center-block">
		<h2 class="mt-3">
			<strong>{{bot.username}}</strong>
			<span class="text-muted">#{{bot.discriminator}}</span>
		</h2>
		<button class="btn btn-primary btn-lg mt-4" :disabled="bot.is_upvoted" @click="upvote">
			Upvote{{bot.is_upvoted ? 'd' : ''}} ({{bot.upvotes}})
		</button>
		<router-link :to="{name: 'view-bot', params: {id: bot.id}}" class="mt-3" id="view-bot-link">
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
	import {extractError, generateRandomString, getAvatar} from '../../helpers';

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
					this.$store.dispatch('bots/upvote', {id: this.$route.params.id}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},

			getAvatar,
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
					{name: 'og:image', content: getAvatar(this.bot), vmid: 'og:image'},
					{name: 'description', content: this.bot.short_description || 'Vote for a bot on Discord Bot List'},
					{property: 'og:title', content: (`Vote for ${this.bot.username}` || 'Vote for a bot') + ' / Discord Bot List'},
					{property: 'og:description', content: this.bot.short_description || 'Vote for a bot on Discord Bot List'},
				],
			};
		},
	};
</script>
