<template>
	<div class="container">
		<div class="expanded row d-none d-md-flex d-lg-flex d-xl-flex">
			<div class="col-4">
				<img :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`" class="user-image">
			</div>
			<div class="col-8">
				<h1 class="username">
					<strong>{{user.username}}</strong>
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
					- {{user.username}} has {{user.bots.length}} bot{{user.bots.length !== 1 ? 's' : ''}} here on PurpleBots
					<br>
					- Their Discord ID is <code>{{user.id}}</code>
					<template v-if="user.admin">
						<br>
						- {{user.username}} is also a PurpleBots administrator
					</template>
				</p>
				<p class="links">
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
				<img :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`" class="user-image center-block">

				<h1 class="username mt-3">
					<strong>{{user.username}}</strong>
					<span class="text-muted">#{{user.discriminator}}</span>
				</h1>
				<h6 class="text-muted">
					Joined: {{moment(user.created_at).fromNow()}} <br>
					Banned: <span :class="{'dangerous-text': user.banned}">{{user.banned ? 'yes! finally!' : 'not yet'}}</span>
				</h6>
				<p class="mt-3">
					- {{user.username}} has {{user.bots.length}} bot{{user.bots.length !== 1 ? 's' : ''}} here on PurpleBots
					<br>
					- Their Discord ID is <code>{{user.id}}</code>
					<template v-if="user.admin">
						<br>
						- {{user.username}} is also a PurpleBots administrator
					</template>
				</p>
				<p class="links">
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
	</div>
</template>

<style scoped>
	.user-image {
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
	import {extractError} from '../../helpers';

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

			moment: moment.utc,
			marked,
		},

		computed: {
			...mapGetters({
				getUserById: 'users/getUserById',
				isAdmin: 'auth/isAdmin',
			}),

			user: function() {
				return this.getUserById(this.$route.params.id);
			}
		},

		meta: function() {
			return {
				title: this.user.username + '#' + this.user.discriminator || 'View user',

				meta: [
					{name: 'description', content: this.user.username ? `View ${this.user.username}'s stats on PurpleBots` : 'View a user on PurpleBots'},
					{property: 'og:title', content: (this.user.username + '#' + this.user.discriminator || 'View user') + ' / PurpleBots'},
					{property: 'og:description', content: this.user.username ? `View ${this.user.username}'s stats on PurpleBots` : 'View a user on PurpleBots'},
				],
			};
		},
	};
</script>
