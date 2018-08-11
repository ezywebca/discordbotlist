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
					<span :class="{
						'fas': true,
						'fa-circle': true,
						'availability-badge': true,
						'ml-2': true,
						'mb-2': true,
						'online': bot.stats.online,
					}" title="Online" />
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
					<span>
						<a href="javascript:undefined" target="_blank" :class="{disabled: bot.is_upvoted}" @click="upvote">
							<span class="mr-1 fas fa-chevron-up"/> Upvote{{bot.is_upvoted ? 'd' : ''}} ({{bot.upvotes}})
						</a>
						<router-link :to="{name: 'upvote-bot', params: {id: bot.client_id}}" class="ml-1 text-muted">
							<em>// voting page</em>
						</router-link>
					</span>
					<a :href="bot.bot_invite" target="_blank"><span class="mr-1 far fa-plus"/> Add bot</a>
					<a :href="bot.server_invite" target="_blank" v-if="bot.server_invite"><span class="mr-1 fas fa-hand-peace"/> Join bot's official server</a>
					<a :href="bot.website" target="_blank" v-if="bot.website"><span class="mr-1 far fa-link"/> See its website</a>
					<a href="javascript:undefined" @click="refreshBot" v-if="isAdmin">
						<span class="mr-1 far fa-sync" /> Refresh bot
					</a>
					<span v-if="isAdmin || bot.owner.id === currentUserId">
						<a href="javascript:undefined" @click="generateToken" :class="{disabled: !!botToken}">
							<span class="mr-1 far fa-code" /> {{botToken ? botToken : 'Generate token'}}
						</a>
						<router-link :to="{name: 'api-docs'}" class="ml-1 text-muted">
							<em>// see docs</em>
						</router-link>
					</span>
					<router-link :to="{name: 'edit-bot', params: {id: bot.client_id}}" v-if="isAdmin || bot.owner.id === currentUserId">
						<span class="mr-1 fas fa-pencil" /> Edit bot info
					</router-link>
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
					<span :class="{
						'fas': true,
						'fa-circle': true,
						'availability-badge': true,
						'ml-2': true,
						'mb-2': true,
						'online': bot.stats.online,
					}" title="Online" />
				</h1>
				<h6 class="text-muted">
					Added: {{moment(bot.created_at).fromNow()}} <br>
					Updated: {{moment(bot.updated_at).fromNow()}} <br>
					Created by: {{bot.owner.username}}#{{bot.owner.discriminator}} <br>
					Prefix: <code>{{bot.prefix}}</code>
				</h6>
				<p class="mt-3">{{bot.short_description}}</p>
				<p class="links">
					<span>
						<a href="javascript:undefined" target="_blank" :class="{disabled: bot.is_upvoted}" @click="upvote">
							<span class="mr-1 fas fa-chevron-up"/> Upvote{{bot.is_upvoted ? 'd' : ''}} ({{bot.upvotes}})
						</a>
						<router-link :to="{name: 'upvote-bot', params: {id: bot.client_id}}" class="ml-1 text-muted">
							<em>// upvoting page</em>
						</router-link>
					</span>
					<a :href="bot.bot_invite" target="_blank"><span class="mr-1 far fa-plus" /> Add bot</a>
					<a :href="bot.server_invite" target="_blank" v-if="bot.server_invite"><span class="mr-1 fas fa-hand-peace" /> Join bot's official server</a>
					<a :href="bot.website" target="_blank" v-if="bot.website"><span class="mr-1 far fa-link" /> See its website</a>
					<a href="javascript:undefined" @click="refreshBot" v-if="isAdmin">
						<span class="mr-1 far fa-sync" /> Refresh bot
					</a>
					<span v-if="isAdmin || bot.owner.id === currentUserId">
						<a href="javascript:undefined" @click="generateToken" v-if="isAdmin || bot.owner.id === currentUserId" :class="{disabled: !!botToken}">
							<span class="mr-1 far fa-code" /> {{botToken ? botToken : 'Generate token'}}
						</a>
						<router-link :to="{name: 'api-docs'}" class="ml-1 text-muted">
							<em>// see docs</em>
						</router-link>
					</span>
					<router-link :to="{name: 'edit-bot', params: {id: bot.client_id}}" v-if="isAdmin || bot.owner.id === currentUserId">
						<span class="mr-1 fas fa-pencil" /> Edit bot info
					</router-link>
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
		background: #202225;
	}

	.links > * {
		display: block;
	}

	.availability-badge {
		vertical-align: middle;
		font-size: 18px;
		color: #747f8d;
	}

	.online {
		color: #43b581;
	}
</style>


<script>
	import moment from 'moment-mini';
	import marked from 'marked';
	import {mapGetters, mapState} from 'vuex';
	import {extractError, generateRandomString} from '../../helpers';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('bots/fetch', {id: route.params.id});
		},

		data: function() {
			return {
				verifyingDeletion: false,
				botToken: '',
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
					axios.post(`/api/bots/${this.$route.params.id}/upvotes`).then(response => {
						this.$store.dispatch('bots/upvote', {clientId: this.$route.params.id});
					}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},

			refreshBot: function() {
				axios.post(`/api/bots/${this.$route.params.id}/refresh`).then(response => {
					this.$router.go();
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			generateToken: function() {
				axios.get(`/api/bots/${this.$route.params.id}/token`).then(response => {
					this.botToken = response.data.token;
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			moment: moment.utc,
			marked,
		},

		computed: {
			...mapState('auth', {
				discordOAuthURL: state => state.discordOAuthURL,
				isAdmin: state => state.admin,
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
				title: this.bot.username || 'View bot',

				meta: [
					{name: 'og:image', content: `https://cdn.discordapp.com/avatars/${this.bot.client_id}/${this.bot.avatar}.png?size=512`, vmid: 'og:image'},
					{name: 'description', content: this.bot.short_description || 'View a bot on PurpleBots'},
					{property: 'og:title', content: (this.bot.username || 'View bot') + ' / PurpleBots'},
					{property: 'og:description', content: this.bot.short_description || 'View a bot on PurpleBots'},
				],
			};
		},
	};
</script>
