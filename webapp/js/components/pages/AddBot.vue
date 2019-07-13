<!--
	Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
	This document is proprietary and confidential.
	Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
-->

<template>
	<div class="container">
		<h1>Add a new bot</h1>
		<div class="mt-4 alert alert-danger">
			<strong>Important notes:</strong>
			<ul>
				<li>Do <strong>not</strong> add bots you do not own.</li>
				<li>Do <strong>not</strong> force people to promote your bot in order to use it.</li>
				<li>Do <strong>not</strong> add wrong information.</li>
			</ul>
			<span>Violation of any of these can result in <strong>permanent ban.</strong> (heh, yes.)</span>
		</div>
		<div class="mt-4 alert alert-warning">
			<strong>Quick approval checklist:</strong>
			<ul>
				<li>Must be online 24/7 practically. Bots hosted on Glitch and stuff are big no.</li>
				<li>Must have <code>help</code> command (or equivalent if not English).</li>
				<li>Must not be a clone of an existing bot.</li>
				<li>Must not respond to other bots.</li>
				<li>~3 seconds is the maximum time we wait for a command to respond before we start flipping tables.</li>
				<li>Short description must explain what the bot does.</li>
				<li>Long description must explain bot features beyond just saying "games, etc. lol".</li>
				<li>No mention of NSFW things in descriptions.</li>
				<li>If bot is NSFW, let us know after you add your bot.</li>
			</ul>
			<span>Your bot much tick all above to be approved (unless you have an excellent reason).</span>
		</div>
		<div class="mt-4 alert alert-success">
			<span>
				In order to add a bot, you <strong>must</strong> to join DBL's official guild:
				<a href="https://discord.gg/cc7Y4jX" target="_blank">https://discord.gg/cc7Y4jX</a>
			</span>
		</div>
		<form class="mt-4" @submit.prevent="add">
			<div class="form-group row">
				<label for="bot-id" class="col-sm-2 col-form-label">Bot ID</label>
				<div class="col-sm-10">
					<input type="text" id="bot-id" class="form-control" v-model="botId" placeholder="Right click bot ⇒ Copy ID" maxlength="32" required>
				</div>
			</div>
			<div class="form-group row">
				<label for="bot-id" class="col-sm-2 col-form-label">Client ID</label>
				<div class="col-sm-10">
					<input type="text" id="bot-id" class="form-control" v-model="clientId" placeholder="New bots have this identical to bot ID" maxlength="32" required>
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="short-description" class="col-sm-2 col-form-label">Short description</label>
				<div class="col-sm-10">
					<textarea id="short-description" class="form-control" v-model="shortDescription" maxlength="191" minlength="32" required
						placeholder="Some sharp, concise, and short description" />
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="long-description" class="col-sm-2 col-form-label">Long description</label>
				<div class="col-sm-10">
					<textarea id="long-description" class="form-control" v-model="longDescription" maxlength="16384"
						placeholder="This is like GitHub's README.md or whatever, you can make it long and include everything. (Markdown only, no custom HTML)" />
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="prefix" class="col-sm-2 col-form-label">Prefix</label>
				<div class="col-sm-10">
					<input type="text" id="prefix" class="form-control" v-model="prefix" maxlength="48" required
						placeholder="Prefix (something like ! or +)">
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="website" class="col-sm-2 col-form-label">Website</label>
				<div class="col-sm-10">
					<input type="url" id="website" class="form-control" v-model="website" maxlength="191"
						placeholder="Main website, not Discord invite or whatever (Optional)">
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="bot-invite" class="col-sm-2 col-form-label">Bot invite</label>
				<div class="col-sm-10">
					<input type="url" id="bot-invite" class="form-control" v-model="botInvite" maxlength="191"
						placeholder="Bot invitation link (the thing users use to make your bot join a guild)">
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="server-invite" class="col-sm-2 col-form-label">Server invite</label>
				<div class="col-sm-10">
					<input type="url" id="server-invite" class="form-control" v-model="serverInvite" maxlength="191"
						placeholder="Official guild invitation (you have one, right? otherwise that's LAME)">
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="tags" class="col-sm-2 col-form-label">Tags</label>
				<div class="col-sm-10">
					<tags-input element-id="tags"
						v-model="tags"
						:existing-tags="availableTags"
						:typeahead="true"
						input-class="form-control"
						only-existing-tags />
				</div>
			</div>
			<p class="mt-4">
				<strong>Make sure you have DMs enabled to receive approval updates.</strong>
				<br>
				<small>We'll use Bot ID to pull more information about your bot.</small>
			</p>
			<button type="submit" class="btn btn-primary mt-2 mb-5" ref="addButton">Add</button>
		</form>
	</div>
</template>

<style scoped>
	#short-description {
		height: 80px;
	}

	#long-description {
		height: 240px;
	}
</style>

<script>
	import { mapState } from 'vuex';
	import { extractError } from '../../helpers';
	import TagsInput from '@voerro/vue-tagsinput';

	export default {
		data: function() {
			return {
				botId: '',
				clientId: '',
				shortDescription: '',
				longDescription: '',
				prefix: '',
				website: '',
				botInvite: '',
				serverInvite: '',
				tags: [],
				added: false
			};
		},

		computed: {
			...mapState('tags', {
				availableTags: state => state.tags.reduce((object, tag) => ({ ...object, [tag.name]: tag.name }), {}),
			})
		},

		asyncData: async (store, route) => {
			await store.dispatch('tags/fetchAll');
		},

		methods: {
			add() {
				this.$refs.addButton.disabled = true;

				axios.post('/api/bots', {
					id: this.botId,
					client_id: this.clientId,
					short_description: this.shortDescription,
					long_description: this.longDescription,
					prefix: this.prefix,
					website: this.website,
					tags: this.tags.join(','),
					bot_invite: this.botInvite,
					server_invite: this.serverInvite,
				}).then(response => {
					this.added = true;
					this.$vueOnToast.pop('error', 'Queued for approval!');
					this.$router.push({name: 'queued'});
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));
					this.$refs.addButton.disabled = false;
				});
			}
		},

		beforeRouteLeave(to, from, next) {
			if (this.added || confirm('You have unsaved changes!')) next();
			else next(false);
		},

		meta: {
			title: 'Add new bot',

			meta: [
				{name: 'description', content: 'Add new bot to Discord Bot List\'s database'},
				{property: 'og:title', content: 'Add new bot / Discord Bots'},
				{property: 'og:description', content: 'Add new bot to Discord Bot List\'s database'},
				{name: 'robots', content: 'noindex'},
			]
		},

		components: {
			'tags-input': TagsInput,
		}
	};
</script>
