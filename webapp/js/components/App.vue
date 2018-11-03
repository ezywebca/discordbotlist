<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div id="app">
		<div id="main-content">
			<toast-container :toastConfig="toastConfig"></toast-container>
			<navbar />
			<router-view />
		</div>
	</div>
</template>

<script type="text/javascript">
	import Navbar from './Navbar';

	export default {
		data: function() {
			return {
				toastConfig: {
					bodyClass: 'toast',
					animation: 'ease-out-left',
				}
			};
		},

		meta: {
			title: '404',
			titleTemplate: '%s / Discord Bots',

			meta: [
				{name: 'og:image', content: '/img/discordbotlist.png', vmid: 'og:image'},
			]
		},

		components: {
			'navbar': Navbar,
		},
	};
</script>