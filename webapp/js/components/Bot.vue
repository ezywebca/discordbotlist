<template>
	<div class="card">
		<router-link :to="{name: 'view-bot', params: {id: bot.id}}">
			<img class="card-img-top" :alt="bot.username"
				:src="`https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png?size=512`">
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
				</h5>
			</router-link>
			<h6 class="card-subtitle mb-2 text-muted">{{bot.upvotes}} upvotes</h6>
			<p class="card-text">{{bot.short_description}}</p>
			<a :href="bot.bot_invite" class="card-link" target="_blank">Add</a>
			<a :href="bot.server_invite" class="card-link" target="_blank" v-if="bot.server_invite">Join server</a>
			<a :href="bot.website" class="card-link" target="_blank" v-if="!bot.server_invite && bot.website">See website</a>
		</div>
	</div>
</template>

<style scoped>
	.availability-badge {
		vertical-align: middle;
		font-size: 15px;
		color: #747f8d;
	}

	.online {
		color: #43b581;
	}
</style>


<script>
	import moment from 'moment-mini';

	export default {
		props: {
			bot: {
				type: Object,
				required: true,
			}
		},

		methods: {
			moment: moment.utc,
		},
	};
</script>

