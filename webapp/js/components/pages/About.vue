<template>
	<div class="container">
		<h1>Talk to us (or, me, for now)</h1>
		<p class="mt-3">Hi I'm <a href="https://microdroid.github.io/">OverCoder</a>#3696 and I created this website in about 1-2 days.</p>
		<p>I'd really like to hear feedbacks about this. Whether your OCD kicks in when viewing a certain page, or whether you want to cry and because someone claimed to be the owner of your bot, please yell to me through:</p>
		<p>
			Email: <a ref="email" /> <br>
			Discord: OverCoder#3696
		</p>
		<p class="mt-3 mb-3">Once you do that, listen to this very interesting song while you wait for an answer:</p>
		<iframe id="cheeky-girls" src="https://www.youtube-nocookie.com/embed/35UUsMnwquo?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen />
	</div>
</template>

<style scoped>
	#cheeky-girls {
		width: 560px;
		height: 315px;
		max-width: 100%;
	}
</style>


<script>
	export default {
		mounted: function() {
			this.$refs.email.innerText = 'yousef.su.2000@gmail.com';
			this.$refs.email.href = 'mailto:yousef.su.2000@gmail.com';
		},

		meta: {
			title: 'About',

			meta: [
				{name: 'description', content: 'Got a feedback? Have a concern for any content? Reach us now!'},
				{property: 'og:title', content: 'About PurpleBots'},
				{property: 'og:description', content: 'Got a feedback? Have a concern for any content? Reach us now!'},
			],
		}
	}
</script>
