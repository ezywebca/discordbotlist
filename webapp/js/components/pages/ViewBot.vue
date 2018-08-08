<template>
	<div class="container">
		<div class="expanded row d-none d-md-flex d-lg-flex d-xl-flex">
			<div class="col-4">
				<img :src="`https://cdn.discordapp.com/avatars/${bot.client_id}/${bot.avatar}.png?size=512`" class="bot-image">
			</div>
			<div class="col-8">
				<h1 class="username">
					<strong>{{bot.username}}</strong>
					<span class="text-muted">#{{bot.discriminator}}</span>
				</h1>
				<h6 class="text-muted">
					<div class="row">
						<div class="col-auto">
							Added: {{moment(bot.created_at).fromNow()}} <br>
							Updated: {{moment(bot.updated_at).fromNow()}}
						</div>
						<div class="col-auto">
							Created by: <router-link :to="{name: 'view-user', params: {id: bot.owner.id}}">{{bot.owner.username}}#{{bot.owner.discriminator}}</router-link> <br>
							Prefix: <code>{{bot.prefix}}</code>
						</div>
					</div>
				</h6>
				<p class="mt-3">{{bot.short_description}}</p>
				<p class="links">
					<a href="javascript:undefined" target="_blank" :class="{disabled: bot.is_upvoted}" @click="upvote">
						<span class="mr-1 fas fa-chevron-up"/> Upvote{{bot.is_upvoted ? 'd' : ''}} ({{bot.upvotes}})
					</a>
					<a :href="bot.bot_invite" target="_blank"><span class="mr-1 far fa-plus"/> Add bot</a>
					<a :href="bot.server_invite" target="_blank" v-if="bot.server_invite"><span class="mr-1 fas fa-hand-peace"/> Join bot's official server</a>
					<a :href="bot.website" target="_blank" v-if="bot.website"><span class="mr-1 far fa-link"/> See its website</a>
					<a href="javascript:undefined" class="dangerous-text" @click="deleteBot" v-if="isAdmin || bot.owner.id === currentUserId">
						<span class="mr-1 fas fa-trash" /> {{verifyingDeletion ? 'You sure?' : 'Delete bot'}}
					</a>
				</p>
			</div>
		</div>

		<!-- Collapsed (Mobile) -->
		<div class="collapsed row d-md-none d-lg-none d-xl-none">
			<div class="text-center">
				<img :src="`https://cdn.discordapp.com/avatars/${bot.client_id}/${bot.avatar}.png?size=512`" class="bot-image center-block">

				<h1 class="username mt-3">
					<strong itemprop="additionalName">{{bot.username}}</strong>
					<span class="text-muted">#{{bot.discriminator}}</span>
				</h1>
				<h6 class="text-muted">
					Added: {{moment(bot.created_at).fromNow()}} <br>
					Updated: {{moment(bot.updated_at).fromNow()}} <br>
					Created by: {{bot.owner.username}}#{{bot.owner.discriminator}} <br>
					Prefix: <code>{{bot.prefix}}</code>
				</h6>
				<p class="mt-3">{{bot.short_description}}</p>
				<p class="links">
					<a href="javascript:undefined" target="_blank" :class="{disabled: bot.is_upvoted}" @click="upvote">
						<span class="mr-1 fas fa-chevron-up"/> Upvote{{bot.is_upvoted ? 'd' : ''}} ({{bot.upvotes}})
					</a>
					<a :href="bot.bot_invite" target="_blank"><span class="mr-1 far fa-plus" /> Add bot</a>
					<a :href="bot.server_invite" target="_blank" v-if="bot.server_invite"><span class="mr-1 fas fa-hand-peace" /> Join bot's official server</a>
					<a :href="bot.website" target="_blank" v-if="bot.website"><span class="mr-1 far fa-link" /> See its website</a>
					<a href="javascript:undefined" class="dangerous-text" @click="deleteBot" v-if="isAdmin || bot.owner.id === currentUserId">
						<span class="mr-1 fas fa-trash" /> {{verifyingDeletion ? 'You sure?' : 'Delete bot'}}
					</a>
				</p>
			</div>
		</div>

		<div class="mt-5" v-html="marked(bot.long_description, {sanitize: true})" />
	</div>
</template>

<style scoped>
	.bot-image {
		width: 100%;
		border-radius: 5px;
	}

	.links a {
		display: block;
	}
</style>


<script>
	import moment from 'moment-mini';
	import marked from 'marked';
	import {mapGetters} from 'vuex';
	import {extractError, generateRandomString} from '../../helpers';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('bots/fetch', {id: route.params.id});
		},

		data: function() {
			return {
				verifyingDeletion: false,
			};
		},

		methods: {
			deleteBot: function() {
				if (!this.verifyingDeletion) {
					this.verifyingDeletion = true;
				} else {
					axios.delete('/api/bots/' + this.$route.params.id).then(response => {
						this.$router.push({name: 'my-bots'});
					}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},

			upvote: function() {
				if (!this.isAuthenticated) {
					const state = generateRandomString(32);
					localStorage.setItem('discord_oauth_state', state);
					window.location = this.discordOAuthURL + '&state=' + state;
				} else {
					axios.post(`/api/bots/${this.$route.params.id}/upvote`).then(response => {
						this.$store.dispatch('bots/upvote', this.$route.params.id);
					}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},
			moment: moment.utc,
			marked,
		},

		computed: {
			...mapGetters({
				discordOAuthURL: 'auth/discordOAuthURL',
				getBotById: 'bots/getBotById',
				isAuthenticated: 'auth/isAuthenticated',
				isAdmin: 'auth/isAdmin',
				currentUserId: 'auth/id',
			}),

			bot: function() {
				return this.getBotById(this.$route.params.id);
			}
		},

		meta: function() {
			return {
				title: this.bot.username || 'View bot',

				meta: [
					{name: 'description', content: this.bot.short_description || 'View a bot on PurpleBots'},
					{property: 'og:title', content: (this.bot.username || 'View bot') + ' / PurpleBots'},
					{property: 'og:description', content: this.bot.short_description || 'View a bot on PurpleBots'},
				],
			};
		},
	};
</script>
