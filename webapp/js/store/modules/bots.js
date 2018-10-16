import * as types from '../mutation-types';
import {unionState} from '../helpers';

const state = {
	mine: [],
	hot: [],
	searchResults: [],
	bots: [],
	all: [],
	uninvited: [],
};



const actions = {
	fetchMine: ({commit}) => {
		return axios.get('/api/bots/mine').then(response => {
			commit(types.STORE_MY_BOTS, response.data);
			return response;
		});
	},

	search: ({commit}, {keywords}) => {
		return axios.get('/api/bots', {
			params: {keywords}
		}).then(response => {
			commit(types.STORE_BOT_SEARCH_RESULTS, response.data);
			return response;
		});
	},

	fetchUninvited: ({commit}) => {
		return axios.get('/api/bots/uninvited').then(response => {
			commit(types.STORE_UNINVITED_BOTS, response.data);
			return response;
		});
	},

	fetchHot: ({commit}) => {
		return axios.get('/api/bots').then(response => {
			commit(types.STORE_HOT_BOTS, response.data);
			return response;
		});
	},
	
	fetch: ({commit}, {id}) => {
		return axios.get('/api/bots/' + id).then(response => {
			commit(types.STORE_BOT, response.data);
			return response;
		});
	},

	upvote: ({commit}, {id}) => {
		return axios.post(`/api/bots/${id}/upvotes`).then(response => {
			commit(types.UPVOTE_BOT, id);
		});
	},

	fetchAll: ({commit}, {skip}) => {
		return axios.get('/api/bots', {
			params: {skip, all: 1}
		}).then(response => {
			commit(types.STORE_ALL_BOTS, response.data);
			return response;
		});
	},

	verify: ({commit}, {id}) => {
		return axios.post(`/api/bots/${id}/verification`).then(response => {
			commit(types.VERIFY_BOT, id);
		});
	},

	unverify: ({commit}, {id}) => {
		return axios.delete(`/api/bots/${id}/verification`).then(response => {
			commit(types.UNVERIFY_BOT, id);
		});
	},

	setNSFW: ({commit}, {id}) => {
		return axios.post(`/api/bots/${id}/nsfw-mark`).then(response => {
			commit(types.SET_BOT_NSFW, id);
		});
	},

	unsetNSFW: ({commit}, {id}) => {
		return axios.delete(`/api/bots/${id}/nsfw-mark`).then(response => {
			commit(types.UNSET_BOT_NSFW, id);
		});
	},

	delete: ({commit}, {id}) => {
		return axios.delete(`/api/bots/${id}`).then(response => {
			commit(types.DELETE_BOT, id);	
		});
	}
};

const mutations = {
	[types.STORE_MY_BOTS](state, bots) {
		state.mine = bots.map(bot => bot.id);
		state.bots = unionState(state.bots, bots, 'id', 'id');
	},

	[types.STORE_BOT_SEARCH_RESULTS](state, bots) {
		state.searchResults = bots.map(bot => bot.id);
		state.bots = unionState(state.bots, bots, 'id', 'id');
	},

	[types.STORE_HOT_BOTS](state, bots) {
		state.hot = bots.map(bot => bot.id);
		state.bots = unionState(state.bots, bots, 'id', 'id');
	},

	[types.STORE_BOT](state, bot) {
		state.bots = unionState(state.bots, [bot], 'id', 'id');
	},

	[types.UPVOTE_BOT](state, id) {
		const bot = state.bots.find(bot => bot.id === id);
		++bot.upvotes;
		bot.upvote_lock = true;
		
		state.bots = unionState(state.bots, [bot], 'id', 'id');
	},

	[types.STORE_ALL_BOTS](state, bots) {
		state.all = [...new Set([
			...state.all,
			...bots.map(bot => bot.id)
		])];
		state.bots = unionState(state.bots, bots, 'id', 'id');
	},

	[types.VERIFY_BOT](state, id) {
		state.bots = unionState(state.bots, [{
			...state.bots.find(bot => bot.id === id),
			verified: true,
		}], 'id', 'id');
	},

	[types.UNVERIFY_BOT](state, id) {
		state.bots = unionState(state.bots, [{
			...state.bots.find(bot => bot.id === id),
			verified: false,
		}], 'id', 'id');
	},

	[types.SET_BOT_NSFW](state, id) {
		state.bots = unionState(state.bots, [{
			...state.bots.find(bot => bot.id === id),
			nsfw: true,
		}], 'id', 'id');
	},

	[types.UNSET_BOT_NSFW](state, id) {
		state.bots = unionState(state.bots, [{
			...state.bots.find(bot => bot.id === id),
			nsfw: false,
		}], 'id', 'id');
	},

	[types.DELETE_BOT](state, id) {
		state.bots = state.bots.filter(bot => bot.id !== id);

		state.hot = state.hot.filter(hot => hot !== id);
		state.searchResults = state.searchResults.filter(result => result !== id);
		state.mine = state.mine.filter(item => item !== id);
		state.all = state.all.filter(item => item !== id);
	},

	[types.STORE_UNINVITED_BOTS](state, bots) {
		state.uninvited = [...new Set([
			...state.all,
			...bots.map(bot => bot.id)
		])];
		state.bots = unionState(state.bots, bots, 'id', 'id');
	}
};

const getters = {
	mine: state => state.mine.map(id => state.bots.find(bot => bot.id === id)),
	uninvited: state => state.uninvited.map(id => state.bots.find(bot => bot.id === id)),
	hot: state => state.hot.map(id => state.bots.find(bot => bot.id === id)),
	searchResults: state => state.searchResults.map(id => state.bots.find(bot => bot.id === id)),
	getBotById: state => id => state.bots.find(bot => bot.id === id),
	all: state => state.all.map(id => state.bots.find(bot => bot.id === id)),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};