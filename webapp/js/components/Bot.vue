<template>
	<div class="card">
		<router-link :to="{name: 'view-bot', params: {id: bot.id}}">
			<img class="card-img-top" :alt="bot.username"
				:src="getAvatar(bot)">
		</router-link>
		<div class="card-body">
			<router-link :to="{name: 'view-bot', params: {id: bot.id}}" class="nostyle">
				<h5 class="card-title">
					{{bot.username}}
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
			<h6 class="card-subtitle mb-2 text-muted">{{bot.upvotes}} upvotes</h6>
			<p class="card-text">{{bot.short_description}}</p>
			<template v-if="overrideInvitation">
				<a :href="`https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&guild_id=450100127256936458`" class="card-link" target="_blank">Add to DBL server</a>
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
</style>


<script>
	import moment from 'moment-mini';
	import {getAvatar} from '../helpers';

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

		methods: {
			moment: moment.utc,
			getAvatar,
		},
	};
</script>

