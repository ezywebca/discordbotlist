<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<div class="expanded row d-none d-md-flex d-lg-flex d-xl-flex"
			itemscope itemtype="http://schema.org/Person">
			<div class="col-4">
				<img :src="getAvatar(user)" class="user-image" itemprop="image">
			</div>
			<div class="col-8">
				<h1 class="username">
					<strong itemprop="additionalName">{{user.username}}</strong>
					<span class="text-muted">#{{user.discriminator}}</span>
				</h1>
				<h6 class="text-muted">
					<div class="row">
						<div class="col-auto">
							Joined: {{moment(user.created_at).fromNow()}}
						</div>
						<div class="col-auto">
							Banned: <span :class="{'dangerous-text': user.banned}">{{user.banned ? 'yes! finally!' : 'not yet'}}</span>
						</div>
					</div>
				</h6>
				<p class="mt-3">
					- {{user.username}} has {{user.bots.length}} bot{{user.bots.length !== 1 ? 's' : ''}} here on Discord Bot List
					<br>
					- Their Discord ID is <code>{{user.id}}</code>
					<template v-if="user.admin">
						<br>
						- {{user.username}} is also a Discord Bot List administrator
					</template>
				</p>
				<p class="links">
					<a href="javascript:undefined" @click="refreshUser" v-if="isAdmin">
						<span class="mr-1 far fa-sync" /> Refresh user
					</a>
					<template v-if="isAdmin && !user.admin">
						<a href="javascript:undefined" class="dangerous-text" @click="banUser" v-if="!user.banned">
							<span class="mr-1 far fa-ban" /> {{verifyingBan ? 'You sure?' : 'Ban user'}}
						</a>
						<a href="javascript:undefined" class="dangerous-text" @click="unbanUser" v-if="user.banned">
							<span class="mr-1 far fa-circle" /> {{verifyingUnban ? 'You sure?' : 'Unban user'}}
						</a>
					</template>
				</p>
			</div>
		</div>

		<!-- Collapsed (Mobile) -->
		<div class="collapsed row d-md-none d-lg-none d-xl-none">
			<div class="text-center">
				<img :src="getAvatar(user)" class="user-image center-block">

				<h1 class="username mt-3">
					<strong>{{user.username}}</strong>
					<span class="text-muted">#{{user.discriminator}}</span>
				</h1>
				<h6 class="text-muted">
					Joined: {{moment(user.created_at).fromNow()}} <br>
					Banned: <span :class="{'dangerous-text': user.banned}">{{user.banned ? 'yes! finally!' : 'not yet'}}</span>
				</h6>
				<p class="mt-3">
					- {{user.username}} has {{user.bots.length}} bot{{user.bots.length !== 1 ? 's' : ''}} here on Discord Bot List
					<br>
					- Their Discord ID is <code>{{user.id}}</code>
					<template v-if="user.admin">
						<br>
						- {{user.username}} is also a Discord Bot List administrator
					</template>
				</p>
				<p class="links">
					<a href="javascript:undefined" @click="refreshUser" v-if="isAdmin">
						<span class="mr-1 far fa-sync" /> Refresh user
					</a>
					<template v-if="isAdmin && !user.admin">
						<a href="javascript:undefined" class="dangerous-text" @click="banUser" v-if="!user.banned">
							<span class="mr-1 far fa-ban" /> {{verifyingBan ? 'You sure?' : 'Ban user'}}
						</a>
						<a href="javascript:undefined" class="dangerous-text" @click="unbanUser" v-if="user.banned">
							<span class="mr-1 far fa-circle" /> {{verifyingUnban ? 'You sure?' : 'Unban user'}}
						</a>
					</template>
				</p>
			</div>
		</div>

		<h3 class="mt-5 mb-3">{{user.username}} owns {{user.bots.length}} bot{{user.bots.length !== 1 ? 's' : ''}}:</h3>
		
		<div class="card-columns">
			<div v-for="bot in user.bots" :key="bot.id">
				<bot :bot="bot"/>
			</div>
		</div>
		<p v-if="user.bots.length < 1">What do you want to see here! Go away!</p>

	</div>
</template>

<style scoped>
	.user-image {
		width: 100%;
		border-radius: 5px;
		background: #202225;
	}

	.links a {
		display: block;
	}

	.links {
		display: inline-block;
	}
</style>


<script>
	import Bot from '../Bot';
	import moment from 'moment-mini';
	import marked from 'marked';
	import {mapGetters, mapState} from 'vuex';
	import {extractError, getAvatar} from '../../helpers';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('users/fetch', {id: route.params.id});
		},

		data: function() {
			return {
				verifyingBan: false,
				verifyingUnban: false,
			};
		},

		methods: {
			banUser: function() {
				if (!this.verifyingBan) {
					this.verifyingBan = true;
				} else {
					axios.post('/api/users/' + this.$route.params.id + '/ban').then(response => {
						this.$router.go();
					}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},

			unbanUser: function() {
				if (!this.verifyingUnban) {
					this.verifyingUnban = true;
				} else {
					axios.delete('/api/users/' + this.$route.params.id + '/ban').then(response => {
						this.$router.go();
					}).catch(e => {
						this.$vueOnToast.pop('error', extractError(e));
					});
				}
			},

			refreshUser: function() {
				axios.post(`/api/users/${this.$route.params.id}/refresh`).then(response => {
					this.$router.go();
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
				});
			},

			moment: moment.utc,
			marked,
			getAvatar,
		},

		computed: {
			...mapState('auth', {
				isAdmin: state => state.admin
			}),
			...mapGetters({
				getUserById: 'users/getUserById',
			}),

			user: function() {
				return this.getUserById(this.$route.params.id);
			}
		},

		meta: function() {
			return {
				title: this.user.username + '#' + this.user.discriminator || 'View user',

				meta: [
					{name: 'og:image', content: getAvatar(this.user), vmid: 'og:image'},
					{name: 'description', content: this.user.username ? `View ${this.user.username}'s stats on Discord Bot List` : 'View a user on Discord Bot List'},
					{property: 'og:title', content: (this.user.username + '#' + this.user.discriminator || 'View user') + ' / Discord Bots'},
					{property: 'og:description', content: this.user.username ? `View ${this.user.username}'s stats on Discord Bot List` : 'View a user on Discord Bot List'},
				],
			};
		},

		components: {
			'bot': Bot,
		},
	};
</script>
