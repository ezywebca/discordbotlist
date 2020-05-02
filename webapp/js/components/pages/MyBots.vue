<template>
	<div class="container">
		<div class="row">
			<div class="col col-auto">
				<h1>My bots</h1>
			</div>
			<div class="col col-auto">
				<router-link :to="{name: 'add-bot'}" class="btn btn-primary mt-2">Add</router-link>
			</div>
		</div>
		<div class="mt-4">
			<div class="row">
				<div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-4" v-for="bot in myBots" :key="bot.id">
					<bot :bot="bot" class="h-100" />
				</div>
			</div>
			<p v-if="myBots.length < 1">You have none.</p>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import Bot from "../Bot";

export default {
	asyncData: function(store, route) {
		return store.dispatch("bots/fetchMine");
	},

	computed: {
		...mapGetters({
			myBots: "bots/mine",
		}),
	},

	meta: {
		title: "My bots",

		meta: [
			{
				name: "description",
				content: "Manage your bots on Discord Bot List",
			},
			{ property: "og:title", content: "My bots / Discord Bots" },
			{
				property: "og:description",
				content: "Manage your bots on Discord Bot List",
			},
			{ name: "robots", content: "noindex" },
		],
	},

	components: {
		bot: Bot,
	},
};
</script>
