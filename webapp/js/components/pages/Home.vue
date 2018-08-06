<template>
	<div class="container" id="header">
		<input class="form-control" v-model="query" placeholder="Search bots">
	</div>
</template>

<script>
	export default {
		data: function() {
			return {
				query: '',
			};
		},

		meta: {
			title: 'Home',

			meta: [
				{name: 'description', content: 'Find new interesting Discord bots, play with them, and get yours listed!'},
				{property: 'og:title', content: 'Home'},
				{property: 'og:description', content: 'Find new interesting Discord bots, play with them, and get yours listed!'},
			],
		}
	}
</script>
