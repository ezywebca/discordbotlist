<template>
	<div class="container">
		<h3>Bot Statistics</h3>
		<p class="mt-2">
			If you're a bot owner, you might want to <code>POST</code> some stats to here. Here are few reasons why:
		</p>
		<ul>
			<li>It makes the bot appear online</li>
			<li>Based on the optional statistics you post, we might use that in the future promote your bot to more users</li>
			<li>GuildsCountMasterRace™</li>
			<li>Stats are fun!</li>
		</ul>
		<p>
			To get started, you first need a bot token. Go to your bot's page, and click 'Generate Token', this will
			create a 64 bytes token. This token has few characteristics:
		</p>
		<ul>
			<li>It doesn't expire just because the clock is moving</li>
			<li>You can only have one token for a given bot</li>
			<li>Once you navigate away off the page the token disappears forever. So save it somewhere safe</li>
			<li>You can invalidate the token by generating a new token</li>
		</ul>
		<p>
			Once you have the token, you can authenticate your request by adding <code>Authorization: Bot &lt;token&gt;</code> to your
			request.
		</p>
		<p>
			Soooo once you get authentication done right, you can <code>POST</code> to <code>/api/bots/:client_id/stats</code> the following:
		</p>
		<ul>
			<li><code>guilds</code> - Number of guilds (int)</li>
			<li><code>users</code> - Number of users (int)</li>
			<li><code>voice_connections</code> - Number of voice connections (int)</li>
		</ul>
		<p>
			<strong>All these fields are optional, though.</strong> You can just <code>POST</code> nothing to the end-point to mark your bot online
			without providing any statistical data.
		</p>
		<p>
			The server will respond with status code <code>204</code>
		</p>
	</div>
</template>

<script>
	export default {
		meta: {
			title: 'API Documentation',

			meta: [
				{name: 'description', content: 'Read on how to use bot tokens and other stuff!'},
				{property: 'og:title', content: 'API Documentation / PurpleBots'},
				{property: 'og:description', content: 'Read on how to use bot tokens and other stuff!'},
				{name: 'robots', content: 'noindex'},
			],
		},
	};
</script>
