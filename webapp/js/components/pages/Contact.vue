<template>
	<div class="container">
		<h1>Contact us</h1>
		<p class="mt-3">Feel free to contact us with any inquiries or questions that you may have. We value any comments or feedback, and read every email that we receive. </p>
		<p>
			Email: <a ref="email" /> <br>
			Discord: <a href="https://discord.gg/cc7Y4jX" target="_blank">https://discord.gg/cc7Y4jX</a>
		</p>
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
		this.$refs.email.innerText = "support@discordbotlist.com";
		this.$refs.email.href = "mailto:support@discordbotlist.com";
	},

	meta: {
		title: "Contact",

		meta: [
			{
				name: "description",
				content:
					"Got a feedback? Have a concern for any content? Reach us now!",
			},
			{ property: "og:title", content: "Contact Discord Bot List" },
			{
				property: "og:description",
				content:
					"Got a feedback? Have a concern for any content? Reach us now!",
			},
		],
	},
};
</script>
