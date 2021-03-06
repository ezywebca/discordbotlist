<template>
	<div>
		<nav class="navbar navbar-toggleable-md navbar-light bg-faded fixed-top d-none d-md-block d-lg-block d-xl-block navbar-expand-md navbar-expand-lg navbar-expand-xl">
			<div class="container">
				<router-link :to="{name: 'home'}" class="navbar-brand">
					<img src="/img/discordbotlist-transparent.svg" alt="Discord Bot List" height="34" title="Discord Bot List">
					<span class="ml-2 thin">DISCORD BOT LIST</span>
				</router-link>

				<ul class="nav navbar-nav ml-3 mr-auto">
					<router-link :to="{name: 'home'}" tag="li" class="nav-item" exact>
						<a class="nav-link">Home</a>
					</router-link>
					<router-link :to="{name: 'bots'}" tag="li" class="nav-item">
						<a class="nav-link">Bots</a>
					</router-link>
					<router-link :to="{name: 'contact'}" tag="li" class="nav-item">
						<a class="nav-link">Contact</a>
					</router-link>
					<router-link :to="{name: 'partners'}" tag="li" class="nav-item">
						<a class="nav-link">Partners</a>
					</router-link>
					<li class="nav-item">
						<a class="nav-link" href="https://medium.com/@DiscordBots" target="_blank">Blog</a>
					</li>
					<router-link :to="{name: 'api-docs'}" tag="li" class="nav-item">
						<a class="nav-link">API</a>
					</router-link>
				</ul>

				<!-- Unprotected links -->
				<ul class="nav navbar-nav" v-if="!isAuthenticated">
					<li class="nav-item">
						<a href="javascript:undefined" class="nav-link" @click="signIn">Sign in with Discord</a>
					</li>
				</ul>

				<!-- Protected links -->
				<ul class="nav navbar-nav" v-if="isAuthenticated">
					<router-link :to="{name: 'view-user', params: {id: user.id}}">
						<img :src="getAvatar(user)" class="profile-image mr-1">
					</router-link>
					<navbar-dropdown :label="user.username"
						:options="dropdownItems"
						@on-select="onDropdown" />
				</ul>
			</div>
		</nav>

		<nav class="navbar navbar-toggleable-md navbar-light bg-faded fixed-top mobile-navbar d-block d-md-none d-lg-none d-xl-none">
			<div>
				<div class="row">
					<div class="col-auto">
						<a class="ml-3" href="javascript:undefined" @click="toggleMenu">
							<i class="fal fa-bars navbar-burger" aria-hidden="true" />
						</a>
					</div>
					<div class="col">
						<router-link :to="{name: 'home'}" class="navbar-brand">
							<img src="/img/discordbotlist-transparent.svg" alt="Discord Bot List" height="34" title="Discord Bot List">
							<span class="ml-2 thin d-none d-sm-inline">DISCORD BOT LIST</span>
							<span class="ml-2 thin d-inline d-sm-none">DBL</span>
						</router-link>
					</div>
				</div>

				<div class="row nav links-bar">
					<router-link :to="{name: 'home'}" tag="li" class="nav-item" exact>
						<a class="nav-link">Home</a>
					</router-link>
					<router-link :to="{name: 'bots'}" tag="li" class="nav-item">
						<a class="nav-link">Bots</a>
					</router-link>
					<router-link :to="{name: 'contact'}" tag="li" class="nav-item">
						<a class="nav-link">Contact</a>
					</router-link>
					<router-link :to="{name: 'partners'}" tag="li" class="nav-item">
						<a class="nav-link">Partners</a>
					</router-link>
					<li class="nav-item">
						<a class="nav-link" href="https://medium.com/@DiscordBots" target="_blank">Blog</a>
					</li>
					<router-link :to="{name: 'api-docs'}" tag="li" class="nav-item">
						<a class="nav-link">API</a>
					</router-link>
				</div>

				<!-- Unprotected links -->
				<div class="navbar-menu" v-if="showMenu && !isAuthenticated">
					<li class="nav-item">
						<a href="javascript:undefined" class="nav-link" @click="signIn">Sign in with Discord</a>
					</li>
				</div>

				<!-- Protected links -->
				<ul class="navbar-menu" v-if="showMenu && isAuthenticated">
					<navbar-dropdown :label="user.username"
						:options="dropdownItems"
						@on-select="onDropdown" />
				</ul>
			</div>
		</nav>
	</div>
</template>

<style type="text/css" scoped>
.thin {
	font-weight: 100;
}

.profile-image {
	height: 36px;
	border-radius: 50%;
	margin-top: 4px;
}
</style>

<script type="text/javascript">
import { mapGetters, mapState } from "vuex";
import NavbarDropdown from "./NavbarDropdown";
import { generateRandomString, getAvatar } from "../helpers";

export default {
	data: function() {
		return {
			showMenu: false,
		};
	},

	methods: {
		toggleMenu: function() {
			this.showMenu = !this.showMenu;
		},

		onDropdown: function(item) {
			switch (item.key) {
				case "sign-out":
					this.$store.dispatch("auth/logout");
					if (this.$route.meta.requiresAuth)
						this.$router.push({ name: "home" });
					break;
				case "tags":
					this.$router.push({ name: "tags" });
					break;
				case "my-bots":
					this.$router.push({ name: "my-bots" });
					break;
				case "approval-queue":
					this.$router.push({ name: "approval-queue" });
					break;
				case "dbl-configurations":
					this.$router.push({ name: "dbl-configurations" });
					break;
				case "toggle-data-saver":
					this.$store.dispatch(
						"preferences/toggleDataSaver",
						!this.dataSaverOn
					);
					break;
			}
		},

		signIn: function() {
			const state = generateRandomString(32);

			localStorage.setItem("discord_oauth_state", state);
			localStorage.setItem(
				"auth_return_url",
				JSON.stringify({
					name: this.$route.name,
					params: this.$route.params,
					query: this.$route.query,
				})
			);

			setTimeout(() => {
				window.location = `${
					this.discordOAuthURL
				}&state=${state}&prompt=none`;
			}, 150);
		},

		getAvatar,
	},

	mounted: function() {
		this.$router.afterEach(() => {
			this.showMenu = false;
		});
	},

	computed: {
		...mapState("auth", {
			discordOAuthURL: (state) => state.discordOAuthURL,
			user: (state) => ({
				id: state.id,
				username: state.username,
				avatar: state.avatar,
				admin: state.admin,
				roles: state.roles,
			}),
		}),

		...mapState("preferences", {
			dataSaverOn: (state) => state.dataSaverOn,
		}),

		...mapGetters({
			isAuthenticated: "auth/isAuthenticated",
			hasRole: "auth/hasRole",
		}),

		dropdownItems: function() {
			return [
				{ label: "My bots", key: "my-bots" },
				{
					label: `Data saver: ${this.dataSaverOn ? "On" : "Off"}`,
					key: "toggle-data-saver",
				},
				...(this.user && this.user.admin
					? [{ label: "Tags", key: "tags" }]
					: []),
				...(this.user &&
				(this.user.admin || this.user.roles.includes("approval"))
					? [{ label: "Approval Queue", key: "approval-queue" }]
					: []),
				...(this.user && this.user.admin
					? [{ label: "DBL Config", key: "dbl-configurations" }]
					: []),
				{ label: "Sign out", key: "sign-out" },
			];
		},
	},

	components: {
		"navbar-dropdown": NavbarDropdown,
	},
};
</script>
