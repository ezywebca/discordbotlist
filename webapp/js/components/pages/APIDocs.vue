<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container mb-5">
		<h3>Bot Statistics</h3>
		<p class="mt-2">
			If you're a bot owner, you might want to <code>POST</code> some stats to here. Here are few reasons why:
		</p>
		<ul>
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
			Soooo once you get authentication done right, you can <code>POST</code> to <code>/api/bots/:bot_id/stats</code> the following:
		</p>
		<ul>
			<li><code>shard_id</code> - Zero-indexed shard ID. <strong>OPTIONAL!!!</strong> (stop telling me 'I don't use sharding') </li>
			<li><code>guilds</code> - Number of guilds (int)</li>
			<li><code>users</code> - Number of users (int)</li>
			<li><code>voice_connections</code> - Number of voice connections (int)</li>
		</ul>
		<p>
			<strong>All these fields are optional.</strong> You can just <code>POST</code> nothing to the end-point, that would probably reset
			the stats for shard <code>0</code> or whatever
		</p>
		<p>
			The server will respond with status code <code>204</code> and will combine stats interally for each shard.
		</p>
		<p>
			<strong>You should know</strong> that if you provide inconsistent data, stats may not show up at all. For example if you provide
			<code>guilds</code> for shard 5 and not for shard 4, the guilds count won't show up at all. You <strong>must</strong> provide consistent
			data in order for stats to show up. If you don't use sharding ignore this.
		</p>
		<p>
			In case you mess things up, we provided implemented a <code>DELETE</code> operation on the same end-point URL for wiping out all the stats
			for all shards for that bot.
		</p>

		<h3>Widget</h3>
		<p>You can embed a nice widget to your website by appending <code>/widget</code> to your bot URL to get an SVG, something like this:</p>

		<pre><code class="lang-html">{{widgetCode}}</code></pre>

		<p>...which looks like this:</p>

		<a href="/bots/460847447602757633">
			<img width="380" height="140" src="/bots/460847447602757633/widget" alt="Lithium stats on Discord Bot List">
		</a>


		<p class="mt-2">
			You can also pass <code>bg</code> GET parameter like <code>bg=400</code> (hex color) to the URL in `src` to customize the background color:
		</p>

		<pre><code class="lang-html">{{coloredWidgetCode}}</code></pre>

		<p>...which looks again like this:</p>

		<a href="/bots/460847447602757633">
			<img width="380" height="140" src="/bots/460847447602757633/widget?bg=400" alt="Lithium stats on Discord Bot List">
		</a>

		<p class="mt-2">
			or make it even totally white:
		</p>

		<a href="/bots/460847447602757633">
			<img width="380" height="140" src="/bots/460847447602757633/widget?bg=fff" alt="Lithium stats on Discord Bot List">
		</a>

		<h3 class="mt-3">Bot verification</h3>
		<p>
			If you want your bot to have a fancy golden star that assures the user the bot is not spam, then
			<router-link :to="{name: 'contact'}">contact us thru Discord.</router-link>
		</p>

		<h3 class="mt-3">Upvote Webhooks</h3>
		<p>
			Upvote webhooks are webhooks that are fired whenever a user upvotes your bot. Configuring it requires:
			<ul>
				<li>A webhook URL. A URL that we will <code>POST</code> to.</li>
				<li>A webhook secret. Used to verify the webhook at your end.</li>
			</ul>

			Whenever the webhook is triggered, it will <code>POST</code> to the specified URL a
			<a href="https://github.com/discordbots/botlister/wiki/User-Object" target="_blank">user object.</a>
			It will also include a custom <code>X-DBL-Signature</code> HTTP header. The header will contain
			two fields:

			<ul>
				<li>The first field is the secret that you provided when setting up the webhook</li>
				<li>The second one is the number of milliseconds since epoch</li>
			</ul>

			<strong>To verify webhook,</strong> first check the secret. If it's correct, check the provided timestamp,
			if it's within something like 2 minutes, accept it, otherwise, reject it.
			<br>
			<strong>The timestamp verification is important</strong> in order to prevent replay attacks.
		</p>
	</div>
</template>

<script>
	import {highlightCode} from '../../helpers';

	export default {
		data: function() {
			return {
				widgetCode: '<a href="https://discordbotlist.com/bots/460847447602757633">\n\t<img \n\t\twidth="380" \n\t\theight="140" \n\t\tsrc="https://discordbotlist.com/bots/460847447602757633/widget" \n\t\talt="Lithium stats on Discord Bot List">\n</a>',
				coloredWidgetCode: '<a href="https://discordbotlist.com/bots/460847447602757633">\n\t<img \n\t\twidth="380" \n\t\theight="140" \n\t\tsrc="https://discordbotlist.com/bots/460847447602757633/widget?bg=400" \n\t\talt="Lithium stats on Discord Bot List">\n</a>',
			};
		},

		meta: {
			title: 'API Documentation',

			meta: [
				{name: 'description', content: 'Read on how to use bot tokens and other stuff!'},
				{property: 'og:title', content: 'API Documentation / Discord Bots'},
				{property: 'og:description', content: 'Read on how to use bot tokens and other stuff!'},
				{name: 'robots', content: 'noindex'},
			],
		},

		mounted() {
			highlightCode();
		}
	};
</script>
