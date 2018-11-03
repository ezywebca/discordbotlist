<template>
	<div class="container">
		<h1>Add a new bot</h1>
		<div class="mt-4 alert alert-danger">
			<strong>Important notes:</strong>
			<ul>
				<li>Do <strong>not</strong> add bots you do not own</li>
				<li>Do <strong>not</strong> force people to promote your bot in order to use it</li>
				<li>Do <strong>not</strong> add wrong information</li>
			</ul>
			<span>Violation of any of these can result in <strong>permanent ban.</strong> (that doesn't make us uncool, dare you!)</span>
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
						placeholder="This is like GitHub's README.md or whatever, you can make it long and include everything. (Markdown supported) (Optional)" />
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
			<p class="mt-4">We'll use Bot ID to pull more information.</p>
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
	import {extractError} from '../../helpers';

	export default {
		data: function() {
			return {
				botId: '',
				shortDescription: '',
				longDescription: '',
				prefix: '',
				website: '',
				botInvite: '',
				serverInvite: '',
				added: false,
			};
		},

		methods: {
			add() {
				this.$refs.addButton.disabled = true;

				axios.post('/api/bots', {
					id: this.botId,
					short_description: this.shortDescription,
					long_description: this.longDescription,
					prefix: this.prefix,
					website: this.website,
					bot_invite: this.botInvite,
					server_invite: this.serverInvite,
				}).then(response => {
					this.added = true;
					this.$vueOnToast.pop('error', 'Queued for approval!');	
					this.$router.push({name: 'view-bot', params: {id: this.botId}});
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));	
					this.$refs.addButton.disabled = false;
				});
			}
		},

		beforeRouteLeave(to, from, next) {
			if (this.added || confirm('You have unsaved changes tho!'))
				next();
			else
				next(false);
		},

		meta: {
			title: 'Add new bot',

			meta: [
				{name: 'description', content: 'Add new bot to Discord Bot List\'s database'},
				{property: 'og:title', content: 'Add new bot / Discord Bot List'},
				{property: 'og:description', content: 'Add new bot to Discord Bot List\'s database'},
				{name: 'robots', content: 'noindex'},
			],
		}
	}
</script>
