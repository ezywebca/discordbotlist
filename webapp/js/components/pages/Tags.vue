<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<form class="form-inline" @submit.prevent="create">
			<input type="text" class="form-control" placeholder="Tag name" v-model="name">
			<button type="submit" class="btn btn-primary ml-2" :disabled="creating">Add</button>
		</form>
		<hr>
		<ul>
			<li v-for="tag in tags" :key="tag.id">
				<router-link :to="{name: 'tag', params: {name: sanitizeTag(tag.name)}}">{{ tag.name }}</router-link>
				(<a href="javascript:undefined" @click="deleteTag(tag.name)">remove</a>)
			</li>
		</ul>
	</div>
</template>

<script>
	import {extractError, sanitizeTag} from '../../helpers';
	import {mapState} from 'vuex';

	export default {
		data: function() {
			return {
				name: '',
				creating: false,
			};
		},

		methods: {
			create() {
				this.creating = true;

				this.$store.dispatch('tags/create', {
					name: this.name,
				}).then(() => {
					this.name = '';
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));	
				}).finally(() => {
					this.creating = false;
				});
			},

			deleteTag(name) {
				if (!confirm(`You sure you want to delete ${name} tag?`))
					return;

				this.$store.dispatch('tags/delete', {
					name
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));	
				});
			},

			sanitizeTag,
		},

		asyncData: function(store) {
			return store.dispatch('tags/fetchAll');
		},

		computed: {
			...mapState('tags', {
				tags: state => state.tags,
			}),
		},

		meta: {
			title: 'Tags',

			meta: [
				{name: 'description', content: 'View and manage tags on Discord Bot List'},
				{property: 'og:title', content: 'Tags / Discord Bots'},
				{property: 'og:description', content: 'View and manage tags on Discord Bot List'},
			],
		},
	};
</script>
