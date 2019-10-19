<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<h1>Approval Queue</h1>

		<p>
			Average time for a response:
			{{ approvalDelay ? duration(approvalDelay).humanize() : 'undetermined' }}
			<br>
			Number of queued bots: {{ bots.length }}
		</p>

		<div class="mt-4">
			<div class="row">
				<div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-4" v-for="bot in bots" :key="bot.id">
					<bot :bot="bot" class="h-100" override-invitation />
				</div>
			</div>
			<p v-if="bots.length < 1">All done!</p>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapState } from 'vuex';
	import Bot from '../Bot';
	import moment from 'moment-mini';

	export default {
		asyncData: function(store, route) {
			return Promise.all([
				store.dispatch('bots/fetchDisapproved'),
				store.dispatch('dbl/fetchApprovalDelay'),
			]);
		},

		computed:{
			...mapGetters({
				bots: 'bots/disapproved',
			}),

			...mapState('dbl', {
				approvalDelay: state => state.approvalDelay,
			}),
		},

		methods: {
			duration: moment.duration,
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
