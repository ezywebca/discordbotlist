<template>
	<div class="container">
		<h1>Edit {{bot.username}}</h1>
		<form class="mt-4" @submit.prevent="save">
			<div class="form-group row mt-3">
				<label for="short-description" class="col-sm-2 col-form-label">Short description</label>
				<div class="col-sm-10">
					<textarea id="short-description" class="form-control" v-model="shortDescription" maxlength="191" minlength="32" required
						placeholder="Some sharp, concise, and short description"/>
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="long-description" class="col-sm-2 col-form-label">Long description</label>
				<div class="col-sm-10">
					<textarea id="long-description" class="form-control" v-model="longDescription" maxlength="8192"
						placeholder="This is like GitHub's README.md or whatever, you can make it long and include everything. (Markdown supported) (Optional)"/>
				</div>
			</div>
			<div class="form-group row mt-3">
				<label for="prefix" class="col-sm-2 col-form-label">Prefix</label>
				<div class="col-sm-10">
					<input type="text" id="prefix" class="form-control" v-model="prefix" maxlength="16" required
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
			<button type="submit" class="btn btn-primary mt-2 mb-5" ref="editButton">Save</button>
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
	import {extractError, getAvatar} from '../../helpers';
	import {mapGetters} from 'vuex';

	export default {
		asyncData: (store, route) => {
			return store.dispatch('bots/fetch', {id: route.params.id});
		},

		data: function() {
			return {
				shortDescription: '',
				longDescription: '',
				prefix: '',
				website: '',
				botInvite: '',
				serverInvite: '',
			};
		},

		mounted: function() {
			this.shortDescription = this.bot.short_description;
			this.longDescription = this.bot.long_description;
			this.prefix = this.bot.prefix;
			this.website = this.bot.website;
			this.botInvite = this.bot.bot_invite;
			this.serverInvite = this.bot.server_invite;
		},

		computed: {
			...mapGetters({
				getBotById: 'bots/getBotById',
			}),

			bot: function() {
				return this.getBotById(this.$route.params.id);
			}
		},

		methods: {
			save() {
				this.$refs.editButton.disabled = true;

				axios.put(`/api/bots/${this.$route.params.id}`, {
					short_description: this.shortDescription,
					long_description: this.longDescription,
					prefix: this.prefix,
					website: this.website,
					bot_invite: this.botInvite,
					server_invite: this.serverInvite,
				}).then(response => {
					this.$router.push({name: 'view-bot', params: {id: this.bot.id}});
				}).catch(e => {
					this.$vueOnToast.pop('error', extractError(e));	
					this.$refs.editButton.disabled = false;
				});
			}
		},

		meta: function() {
			return {
				title: `Edit ${this.bot.username}` || 'Edit bot',

				meta: [
					{name: 'og:image', content: getAvatar(this.bot), vmid: 'og:image'},
					{name: 'description', content: this.bot.short_description || 'Edit a bot on Discord Bot List'},
					{property: 'og:title', content: (`Edit ${this.bot.username}` || 'Edit bot') + ' / Discord Bot List'},
					{property: 'og:description', content: this.bot.short_description || 'Edit a bot on Discord Bot List'},
				],
			};
		},
	}
</script>
