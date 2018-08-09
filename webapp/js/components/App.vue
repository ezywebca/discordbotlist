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
			titleTemplate: '%s / PurpleBots',

			meta: [
				{name: 'og:image', content: '/img/purplebots.png', vmid: 'og:image'},
			]
		},

		components: {
			'navbar': Navbar,
		},
	};
</script>