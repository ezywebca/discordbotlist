<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<h1>Approval Queue</h1>
		<div class="mt-4">
			<div class="card-columns">
				<div v-for="bot in bots" :key="bot.id">
					<bot :bot="bot" override-invitation/>
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
			return store.dispatch('bots/fetchDisapproved');
		},

		computed:{
			...mapGetters({
				bots: 'bots/disapproved',
			})
		},

		meta: {
			title: 'Approval Queue',

			meta: [
				{name: 'description', content: 'Manage bots approval queue on Discord Bot List'},
				{property: 'og:title', content: 'Approval Queue / Discord Bots'},
				{property: 'og:description', content: 'Manage bots approval queue on Discord Bot List'},
				{name: 'robots', content: 'noindex'},
			],
		},

		components: {
			'bot': Bot,
		}
	};
</script>
