<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container" id="header">
		<h1>Discord {{ tag.name }} bots</h1>
		<div class="row mt-4"
			v-infinite-scroll="loadMore" infinite-scroll-disabled="disableScroll" infinite-scroll-distance="10">
			<div class="col-12 col-sm-6 col-md-4 col-xl-3">
				<bot :bot="bot" v-for="bot in bots" :key="bot.id" />
			</div>
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
	import {desanitizeTag} from '../../helpers';

	export default {
		data: function() {
			return {
				loading: false,
				end: false,
				disableScroll: false,
			};
		},

		asyncData: async function(store, route) {
			await store.dispatch('tags/fetch', {
				name: desanitizeTag(route.params.name),
			});

			await store.dispatch('tags/fetchBots', {
				name: desanitizeTag(route.params.name),
				skip: 0
			});
		},

		methods: {
			loadMore: debounce(function() {
				this.loading = true;
				this.disableScroll = true;

				this.$store.dispatch('tags/fetchBots', {
					name: desanitizeTag(this.$route.params.name),
					skip: this.bots.length
				}).then(response => {
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
				getTagBots: 'tags/getTagBots',
				getTagByName: 'tags/getTagByName',
			}),

			tag() {
				return this.getTagByName(desanitizeTag(this.$route.params.name));
			},

			bots() {
				return this.getTagBots(desanitizeTag(this.$route.params.name));
			}
		},

		meta: function() {
			return {
				title: `Discord ${this.tag.name} bots`,

				meta: [
					{name: 'description', content: `Let's find some interesting Discord ${this.tag.name} bots on Discord Bot List`},
					{property: 'og:title', content: `Discord ${this.tag.name} bots / Discord bots`},
					{property: 'og:description', content: `Let's find some interesting Discord ${this.tag.name} bots on Discord Bot List`},
				],
			};
		},

		components: {
			'bot': Bot,
		}
	};
</script>
