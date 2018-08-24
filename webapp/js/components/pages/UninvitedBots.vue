<template>
	<div class="container">
		<h1>Uninvited bots</h1>
		<div class="mt-4">
			<div class="card-columns">
				<div v-for="bot in bots" :key="bot.id">
					<bot :bot="bot"/>
				</div>
			</div>
			<p v-if="bots.length < 1">All done!</p>
		</div>
	</div>
</template>

<script>
	import {mapGetters} from 'vuex';
	import Bot from '../Bot';

	export default {
		asyncData: function(store, route) {
			return store.dispatch('bots/fetchUninvited');
		},

		computed:{
			...mapGetters({
				bots: 'bots/uninvited',
			})
		},

		meta: {
			title: 'Uninvited bots',

			meta: [
				{name: 'description', content: 'Manage uninvited bots on Discord Bot List'},
				{property: 'og:title', content: 'Uninvited bots / Discord Bot List'},
				{property: 'og:description', content: 'Manage uninvited bots on Discord Bot List'},
				{name: 'robots', content: 'noindex'},
			],
		},

		components: {
			'bot': Bot,
		}
	};
</script>
