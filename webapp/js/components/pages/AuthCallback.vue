<template>
	<div class="container">
		<h4>{{status}}</h4>
	</div>
</template>

<script>
import {
	getURLParameter,
	extractError,
	urlB64ToUint8Array,
} from "../../helpers";

export default {
	data: function() {
		return {
			status: "Contacting Discord…",
		};
	},

	mounted: function() {
		const code = getURLParameter("code");
		const state = getURLParameter("state");

		if (code) {
			const originalState = localStorage.getItem("discord_oauth_state");

			if (!originalState || originalState !== state) {
				this.status = "State mismatch error.";
			} else {
				localStorage.removeItem("discord_oauth_state");

				this.$store
					.dispatch("auth/login", code)
					.then(async () => {
						const applicationServerKey = urlB64ToUint8Array(
							process.env.VAPID_PUBLIC
						);

						navigator.serviceWorker
							.register("/sw.js")
							.then(async (swReg) => {
								const subscribe = async () => {
									const options = {
										userVisibleOnly: true,
										applicationServerKey,
									};

									const subscription = await swReg.pushManager.subscribe(
										options
									);
									const json = subscription.toJSON();

									axios.post("/api/push-subscriptions", {
										endpoint: json.endpoint,
										p256dh: json.keys.p256dh,
										auth: json.keys.auth,
									});
								};

								const existingSubscription = await swReg.pushManager.getSubscription();

								if (existingSubscription)
									await existingSubscription.unsubscribe();

								await subscribe();
							})
							.catch(console.error);

						try {
							this.$router.push(
								JSON.parse(
									localStorage.getItem("auth_return_url")
								)
							);
						} catch (e) {
							this.$router.push({ name: "home" });
						}
					})
					.catch((error) => {
						this.status = extractError(error);
					});
			}
		} else {
			this.status = "Missing auth code.";
		}
	},

	meta: {
		title: "Completing Authentication",

		meta: [
			{
				name: "description",
				content: "Who is linking to this page? Please report.",
			},
			{
				property: "og:title",
				content: "Completing Authentication / Discord Bots",
			},
			{
				property: "og:description",
				content: "Who is linkng to this page? Please report.",
			},
			{ name: "robots", content: "noindex" },
		],
	},
};
</script>
