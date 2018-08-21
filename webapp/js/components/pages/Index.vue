<template>
	<div class="container" id="header">
		<div class="card-columns"
			v-infinite-scroll="loadMore" infinite-scroll-disabled="disableScroll" infinite-scroll-distance="10">
			<bot :bot="bot" v-for="bot in bots" :key="bot.id" />
		</div>
		<p v-if="!loading && bots.length < 1">There's none.</p>
		<div v-if="end" class="mt-4 text-muted text-center">
			<p> - That's it! - </p>
		</div>
	</div>
</template>

<script>
	import debounce from 'lodash.debounce';
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
			return store.dispatch('bots/fetchIndex', {skip: 0});
		},

		methods: {
			loadMore: debounce(function() {
				this.loading = true;
				this.disableScroll = true;

				this.$store.dispatch('bots/fetchIndex', {skip: this.bots.length}).then(response => {
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
				bots: 'bots/index',
			}),
		},

		meta: {
			title: 'Index',

			meta: [
				{name: 'description', content: 'All the bots on Discord Bot List!'},
				{property: 'og:title', content: 'Index / Discord Bot List'},
				{property: 'og:description', content: 'All the bots on Discord Bot List!'},
			],
		},

		components: {
			'bot': Bot,
		}
	};
</script>
