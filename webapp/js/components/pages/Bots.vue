<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container" id="header">
		<div class="row"
			v-infinite-scroll="loadMore" infinite-scroll-disabled="disableScroll" infinite-scroll-distance="10">
			<div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-4" v-for="bot in bots" :key="bot.id">
				<bot :bot="bot" class="h-100" />
			</div>
		</div>
		<p v-if="!loading && bots.length < 1">There's none.</p>
		<div v-if="end" class="mt-4 text-muted text-center">
			<p> - That's it! - </p>
		</div>
	</div>
</template>

<script>
	import {debounce} from 'lodash';
	import {mapGetters} from 'vuex';
	import Bot from '../Bot';

	export default {
		data: function() {
			return {
				loading: false,
				end: false,
				disableScroll: false,
			};
		},

		asyncData: function(store) {
			return store.dispatch('bots/fetchAll', {skip: 0});
		},

		methods: {
			loadMore: debounce(function() {
				this.loading = true;
				this.disableScroll = true;

				this.$store.dispatch('bots/fetchAll', {skip: this.bots.length}).then(response => {
					if (response.data && response.data.length < 1)
						this.end = true;
					else
						this.disableScroll = false;

					this.loading = false;
				});
			}, 300),
		},

		computed: {
			...mapGetters({
				bots: 'bots/all',
			}),
		},

		meta: {
			title: 'Bots',

			meta: [
				{name: 'description', content: 'All the bots on Discord Bot List!'},
				{property: 'og:title', content: 'Bots / Discord Bots'},
				{property: 'og:description', content: 'All the bots on Discord Bot List!'},
			],
		},

		components: {
			'bot': Bot,
		}
	};
</script>
