<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="card">
		<router-link :to="{name: 'view-bot', params: {id: bot.id}}">
			<div class="bot-image-container">
				<img class="card-img-top bot-image" :class="{nsfw: bot.nsfw}"
					:alt="bot.username" :src="getAvatar(bot)">
			</div>
		</router-link>
		<div class="card-body">
			<router-link :to="{name: 'view-bot', params: {id: bot.id}}" class="nostyle">
				<h5 class="card-title">
					{{bot.username}}
					<span class="badge badge-danger ml-2" v-if="bot.nsfw">NSFW</span>
					<span :class="{
						'fas': true,
						'fa-circle': true,
						'availability-badge': true,
						'ml-2': true,
						'mb-1': true,
						'online': bot.stats.online,
					}" :title="bot.stats.online ? 'Online' : 'Offline'" />
					<span class=" fas fa-star ml-1 mb-1 verification-badge" title="Verified" v-if="bot.verified" />
				</h5>
			</router-link>
			<h6 class="card-subtitle mb-2 text-muted">
				{{bot.upvotes}} upvotes
				<template v-if="bot.stats.guilds">
					• {{formatNumber(bot.stats.guilds)}} servers
				</template>
			</h6>
			<p class="card-text">{{bot.short_description}}</p>
			<template v-if="overrideInvitation">
				<a href="javascript:undefined" class="card-link" @click="approve"
					:class="{disabled: (!bot.in_testing_guild && !addedToTesting) || approving || approved || denying || denied}">
					{{ approving ? 'Approving…' : (approved ? 'Approved' : 'Approve') }}
				</a>
				<a href="javascript:undefined" class="card-link" @click="deny"
					:class="{disabled: approving || approved || denying || denied}">
					{{ denying ? 'Denying…' : (denied ? 'Denied' : 'Deny') }}
				</a>
				<a href="javascript:undefined" class="card-link" @click="test"
					:class="{disabled: bot.in_testing_guild || addedToTesting || approving || approved || denying || denied}">
					{{ bot.in_testing_guild || addedToTesting ? 'In testing' : 'Test' }}
				</a>
			</template>
			<template v-else>
				<a :href="bot.bot_invite" class="card-link" target="_blank">Add</a>
				<a :href="bot.server_invite" class="card-link" target="_blank" v-if="bot.server_invite">Join server</a>
				<a :href="bot.website" class="card-link" target="_blank" v-if="!bot.server_invite && bot.website">See website</a>
			</template>
		</div>
	</div>
</template>

<style scoped>
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
	.bot-image-container {
		overflow: hidden;
	}

	.bot-image.nsfw {
		filter: grayscale(1) blur(15px);
		transition: filter 0.5s;
	}

	.bot-image.nsfw:hover {
		filter: none;
		transition: filter 1.25s;
	}
</style>


<script>
	import moment from 'moment-mini';
	import {getAvatar, formatNumber, extractError} from '../helpers';

	export default {
		props: {
			bot: {
				type: Object,
				required: true,
			},

			overrideInvitation: {
				type: Boolean,
				required: false,
				default: false,
			},
		},

		data() {
			return {
				approving: false,
				approved: false,

				denying: false,
				denied: false,

				addedToTesting: false,
			};
		},

		methods: {
			approve() {
				axios.post(`/api/bots/disapproved/${this.bot.id}/approve`).then(response => {
					this.approved = true;
					this.approving = false;
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));	
					this.approving = false;
				});

				window.open(`https://discordapp.com/oauth2/authorize?client_id=${this.bot.id}&scope=bot&guild_id=450100127256936458`);
			},

			deny() {
				this.denying = true;

				const reason = prompt('Reason for denial:');

				if (!reason) {
					this.$vueOnToast.pop('error', 'You need to provide a reason when denying a bot');
					this.denying = false;
					return;
				}

				axios.post(`/api/bots/disapproved/${this.bot.id}/deny`, {
					reason,
				}).then(response => {
					this.denied = true;
					this.denying = false;
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));	
					this.denying = false;
				});
			},

			test() {
				window.open(`https://discordapp.com/oauth2/authorize?client_id=${this.bot.id}&scope=bot&guild_id=530821081485803571`);
				this.addedToTesting = true;
			},
			
			moment: moment.utc,
			getAvatar,
			formatNumber,
		},
	};
</script>

