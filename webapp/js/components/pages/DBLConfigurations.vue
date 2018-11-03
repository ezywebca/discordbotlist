<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<h4>DBL configurations</h4>
		<ul>
			<li>
				DB:
				<a :class="{'dangerous-text': config.db_locked, 'success-text': !config.db_locked}" href="javascript:undefined" @click="toggleDBLock">
					{{config.db_locked ? 'Locked' : 'Unlocked'}}
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
	import {mapState} from 'vuex';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('dbl/fetchConfig');
		},

		computed: {
			...mapState('dbl', {
				config: state => state.config,
			}),
		},

		methods: {
			toggleDBLock() {
				if (this.config.db_locked)
					this.$store.dispatch('dbl/unlockDB');
				else
					this.$store.dispatch('dbl/lockDB');
			}
		},
		
		meta: {
			title: 'DBL Configurations',

			meta: [
				{name: 'description', content: 'Top secret page'},
				{property: 'og:title', content: 'DBL Configurations'},
				{property: 'og:description', content: 'Top secret page'},
				{name: 'robots', content: 'noindex'},
			],
		},
	}
</script>
