<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<div class="expanded row d-none d-md-flex d-lg-flex d-xl-flex">
			<div class="col-4">
				<div class="bot-image-container">
					<img :src="getAvatar(bot)" class="bot-image" :class="{nsfw: bot.nsfw}">
				</div>
			</div>
			<div class="col-8">
				<h1 class="username">
					<strong>{{bot.username}}</strong>
					<span class="text-muted">#{{bot.discriminator}}</span>
					<span class="badge badge-danger ml-2" v-if="bot.nsfw">NSFW</span>
					<span :class="{
						'fas': true,
						'fa-circle': true,
						'availability-badge': true,
						'ml-2': true,
						'mb-2': true,
						'online': bot.stats.online,
					}" :title="bot.stats.online ? 'Online' : 'Offline'" />
					<span class=" fas fa-star ml-1 mb-2 verification-badge" title="Verified" v-if="bot.verified" />
				</h1>
				<h6 class="text-muted">
					<div class="row">
						<div class="col-auto">
							Added: {{moment(bot.created_at).fromNow()}} <br>
							Updated: {{moment(bot.updated_at).fromNow()}}

							<template v-if="bot.stats.guilds">
								<br>
								Servers: {{formatNumber(bot.stats.guilds)}}
							</template>

							<template v-if="bot.stats.voice_connections">
								<br>
								Voice connections: {{formatNumber(bot.stats.voice_connections)}}
							</template>
						</div>
						<div class="col-auto">
							Created by: <router-link :to="{name: 'view-user', params: {id: bot.owner.id}}">{{bot.owner.username}}#{{bot.owner.discriminator}}</router-link> <br>
							Prefix: <code>{{bot.prefix}}</code>

							<template v-if="bot.stats.users">
								<br>
								Users: {{formatNumber(bot.stats.users)}}
							</template>
						</div>
					</div>
				</h6>
				<p class="mt-3">{{bot.short_description}}</p>
				<p class="links">
					<span>
						<a href="javascript:undefined" :class="{disabled: bot.upvote_lock}" @click="upvote">
							<span class="mr-1 fas fa-chevron-up"/> Upvote{{bot.upvote_lock ? 'd' : ''}} ({{bot.upvotes}})
						</a>
						<router-link :to="{name: 'upvote-bot', params: {id: bot.id}}" class="ml-1 text-muted">
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
							<span class="mr-1 far fa-code" /> {{botToken ? botToken : (verifyingTokenGeneration ? 'You sure? This will invalidate old one' : 'Generate token')}}
						</a>
						<router-link :to="{name: 'api-docs'}" class="ml-1 text-muted">
							<em>// see docs</em>
						</router-link>
					</span>
					<a href="javascript:undefined" @click="() => (bot.verified ? unverifyBot : verifyBot)()" v-if="isAdmin">
						<span class="mr-1 fas fa-star" /> {{bot.verified ? 'Un-verify bot' : 'Verify bot'}}
					</a>
					<a href="javascript:undefined" @click="() => (bot.nsfw ? unsetNSFW : setNSFW)()" v-if="isAdmin">
						<span class="mr-1 fas fa-exclamation-triangle" /> {{bot.nsfw ? 'Unset NSFW' : 'Set NSFW'}}
					</a>
					<router-link :to="{name: 'edit-bot', params: {id: bot.id}}" v-if="isAdmin || bot.owner.id === currentUserId">
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
				<div class="bot-image-container">
					<img :src="getAvatar(bot)" class="bot-image center-block" :class="{nsfw: bot.nsfw}">
				</div>
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
					}" :title="bot.stats.online ? 'Online' : 'Offline'" />
					<span class=" fas fa-star ml-1 mb-2 verification-badge" title="Verified" v-if="bot.verified" />
					<br>
					<span class="badge badge-danger ml-2" v-if="bot.nsfw">NSFW</span>
				</h1>
				<h6 class="text-muted">
					Added: {{moment(bot.created_at).fromNow()}} <br>
					Updated: {{moment(bot.updated_at).fromNow()}} <br>
					Created by: {{bot.owner.username}}#{{bot.owner.discriminator}} <br>
					Prefix: <code>{{bot.prefix}}</code>
					<template v-if="bot.stats.guilds">
						<br>
						Servers: {{formatNumber(bot.stats.guilds)}}
					</template>
					<template v-if="bot.stats.users">
						<br>
						Users: {{formatNumber(bot.stats.users)}}
					</template>
					<template v-if="bot.stats.voice_connections">
						<br>
						Voice connections: {{formatNumber(bot.stats.voice_connections)}}
					</template>
				</h6>
				<p class="mt-3">{{bot.short_description}}</p>
				<p class="links">
					<span>
						<a href="javascript:undefined" :class="{disabled: bot.upvote_lock}" @click="upvote">
							<span class="mr-1 fas fa-chevron-up"/> Upvote{{bot.upvote_lock ? 'd' : ''}} ({{bot.upvotes}})
						</a>
						<router-link :to="{name: 'upvote-bot', params: {id: bot.id}}" class="ml-1 text-muted">
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
							<span class="mr-1 far fa-code" /> {{botToken ? botToken : (verifyingTokenGeneration ? 'You sure? This will invalidate old one' : 'Generate token')}}
						</a>
						<router-link :to="{name: 'api-docs'}" class="ml-1 text-muted">
							<em>// see docs</em>
						</router-link>
					</span>
					<a href="javascript:undefined" @click="() => (bot.verified ? unverifyBot : verifyBot)()" v-if="isAdmin">
						<span class="mr-1 fas fa-star" /> {{bot.verified ? 'Un-verify bot' : 'Verify bot'}}
					</a>
					<a href="javascript:undefined" @click="() => (bot.nsfw ? unsetNSFW : setNSFW)()" v-if="isAdmin">
						<span class="mr-1 fas fa-exclamation-triangle" /> {{bot.nsfw ? 'Unset NSFW' : 'Set NSFW'}}
					</a>
					<router-link :to="{name: 'edit-bot', params: {id: bot.id}}" v-if="isAdmin || bot.owner.id === currentUserId">
						<span class="mr-1 fas fa-pencil" /> Edit bot info
					</router-link>
					<a href="javascript:undefined" class="dangerous-text" @click="deleteBot" v-if="isAdmin || bot.owner.id === currentUserId">
						<span class="mr-1 fas fa-trash" /> {{verifyingDeletion ? 'You sure?' : 'Delete bot'}}
					</a>
				</p>
			</div>
		</div>

		<h5 class="tags-bar text-center text-md-left mt-4">
			<router-link :to="{name: 'tag', params: {name: tag.name}}" class="badge badge-primary mr-2" v-for="tag in bot.tags" :key="tag.name">
				{{ tag.name }}
			</router-link>
		</h5>

		<div class="mt-3 description" v-html="marked(bot.long_description, {sanitize: true})" />
	</div>
</template>

<style scoped>
	.bot-image-container {
		overflow: hidden;
	}

	.bot-image {
		width: 100%;
		border-radius: 5px;
		background: #202225;
	}

	.bot-image.nsfw {
		filter: grayscale(1) blur(15px);
		transition: filter 0.5s;
	}

	.bot-image.nsfw:hover {
		filter: none;
		transition: filter 1.25s;
	}

	.links > * {
		display: block;
	}

	.links {
		display: inline-block;
	}

	.verification-badge, .availability-badge {
		vertical-align: middle;
		font-size: 18px;
	}

	.verification-badge {
		color: #e0cf37;
	}

	.availability-badge {
		color: #747f8d;
	}

	.online {
		color: #43b581;
	}

	.description >>> img {
		max-width: 100%;
	}
</style>


<script>
	import moment from 'moment-mini';
	import marked from 'marked';
	import {mapGetters, mapState} from 'vuex';
	import {extractError, generateRandomString, formatNumber, getAvatar, highlightCode} from '../../helpers';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('bots/fetch', {id: route.params.id});
		},

		data: function() {
			return {
				verifyingDeletion: false,
				verifyingTokenGeneration: false,
				botToken: '',
			};
		},

		methods: {
			deleteBot: function() {
				if (!this.verifyingDeletion) {
					this.verifyingDeletion = true;
				} else {
					this.$router.push({name: 'my-bots'});
					this.$store.dispatch('bots/delete', {id: this.$route.params.id}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},

			upvote: function() {
				if (!this.isAuthenticated) {
					const state = generateRandomString(32);
					
					localStorage.setItem('discord_oauth_state', state);
					localStorage.setItem('auth_return_url', JSON.stringify({
						name: this.$route.name,
						params: this.$route.params,
						query: this.$route.query,
					}));
					
					setTimeout(() => {window.location = this.discordOAuthURL + '&state=' + state;}, 150);
				} else {
					this.$store.dispatch('bots/upvote', {id: this.$route.params.id}).catch(e => {
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
				if (!this.verifyingTokenGeneration)
					return this.verifyingTokenGeneration = true;
				
				axios.get(`/api/bots/${this.$route.params.id}/token`).then(response => {
					this.botToken = response.data.token;
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			verifyBot: function() {
				this.$store.dispatch('bots/verify', {id: this.$route.params.id}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			unverifyBot: function() {
				this.$store.dispatch('bots/unverify', {id: this.$route.params.id}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			setNSFW: function() {
				this.$store.dispatch('bots/setNSFW', {id: this.$route.params.id}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			unsetNSFW: function() {
				this.$store.dispatch('bots/unsetNSFW', {id: this.$route.params.id}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			moment: moment.utc,
			marked,
			formatNumber,
			getAvatar,
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

		mounted: function() {
			highlightCode();
			document.querySelectorAll('.description table').forEach(table => table.classList.add('table'));
		},

		meta: function() {
			return {
				title: this.bot.username || 'View bot',

				meta: [
					{name: 'og:image', content: getAvatar(this.bot), vmid: 'og:image'},
					{name: 'description', content: this.bot.short_description || 'View a bot on Discord Bot List'},
					{property: 'og:title', content: (this.bot.username || 'View bot') + ' / Discord Bots'},
					{property: 'og:description', content: this.bot.short_description || 'View a bot on Discord Bot List'},
				],
			};
		},
	};
</script>
