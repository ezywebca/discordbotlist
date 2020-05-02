<template>
	<div class="container">
		<span class="far fa-check checkmark" />

		<h1 class="mt-3">Queued</h1>
		<p class="mt-4">
			Your bot has been added to the queue. Hang tight while we review your submission.
			<br>
			DiscordBotList bot will send you further updates.
			<br>
		</p>

		<p class="mt-4 text-muted">
			<small>
				Average time for a response:
				{{ approvalDelay ? duration(approvalDelay).humanize() : 'undetermined' }}
			</small>
		</p>
	</div>
</template>

<style scoped>
.checkmark {
	font-size: 10rem;
	margin-top: 2rem;
	color: #77b255;
	text-align: center;
	display: block;
}

.container {
	text-align: center;
}
</style>

<script>
import { mapState } from "vuex";
import moment from "moment-mini";

export default {
	asyncData(store) {
		return store.dispatch("dbl/fetchApprovalDelay");
	},

	computed: {
		...mapState("dbl", {
			approvalDelay: (state) => state.approvalDelay,
		}),
	},

	methods: {
		duration: moment.duration,
	},

	meta: {
		title: "Bot queued",

		meta: [
			{
				name: "description",
				content: "Bot has been added to the approval queue.",
			},
			{ property: "og:title", content: "Bot queued / Discord Bots" },
			{
				property: "og:description",
				content: "Bot has been added to the approval queue.",
			},
			{ name: "robots", content: "noindex" },
		],
	},
};
</script>
