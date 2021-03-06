<template>
	<div class="container" id="header">
		<input class="form-control" v-model="keywords" placeholder="Search bots">
		<div class="mt-4">
			<div class="row">
				<div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-4" v-for="bot in bots" :key="bot.id">
					<bot :bot="bot" class="h-100"/>
				</div>
			</div>
			<p v-if="!loading && bots.length < 1">There's none.</p>
		</div>
	</div>
</template>

<script>
import { debounce } from "lodash";
import { extractError } from "../../helpers";
import { mapGetters } from "vuex";
import Bot from "../Bot";

export default {
	data: function() {
		return {
			keywords: "",
			loading: false, // used in template
		};
	},

	asyncData: function(store, route) {
		if (route.query.q)
			return store
				.dispatch("bots/search", { keywords: route.query.q })
				.catch(() => {});
		else return store.dispatch("bots/fetchHot");
	},

	watch: {
		keywords: function() {
			if (this.keywords) {
				this.search(this.keywords);
			} else {
				if (!this.hot || this.hot.length < 1) {
					this.loading = true;
					this.$store.dispatch("bots/fetchHot").then(() => {
						this.loading = false;
					});
				}
				this.$router.replace({ name: "home" });
			}
		},
	},

	created: function() {
		this.keywords = this.$route.query.q;
	},

	methods: {
		search: debounce(async function(keywords) {
			this.$router.replace({ name: "home", query: { q: keywords } });
			this.loading = true;
			return this.$store
				.dispatch("bots/search", { keywords })
				.then(() => {
					this.loading = false;
				})
				.catch((e) => {
					this.$vueOnToast.pop("error", extractError(e));
				});
		}, 300),
	},

	computed: {
		...mapGetters({
			hot: "bots/hot",
			searchResults: "bots/searchResults",
		}),

		bots: function() {
			if (this.keywords) return this.searchResults;
			else return this.hot;
		},
	},

	meta: {
		title: "Home",

		meta: [
			{
				name: "description",
				content:
					"Find new interesting Discord bots, play with them, and get yours listed!",
			},
			{ property: "og:title", content: "Home / Discord Bots" },
			{
				property: "og:description",
				content:
					"Find new interesting Discord bots, play with them, and get yours listed!",
			},
		],
	},

	components: {
		bot: Bot,
	},
};
</script>
