import * as types from '../mutation-types';
import {unionState} from '../helpers';

const state = {
	mine: [],
	hot: [],
	searchResults: [],
	bots: [],
	index: [],
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

	fetchIndex: ({commit}, {skip}) => {
		return axios.get('/api/bots', {
			params: {skip, all: 1}
		}).then(response => {
			commit(types.STORE_INDEX_BOTS, response.data);
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
		bot.is_upvoted = true;
		
		state.bots = unionState(state.bots, [bot], 'id', 'id');
	},

	[types.STORE_INDEX_BOTS](state, bots) {
		state.index = [...new Set([
			...state.index,
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
};

const getters = {
	mine: state => state.mine.map(id => state.bots.find(bot => bot.id === id)),
	hot: state => state.hot.map(id => state.bots.find(bot => bot.id === id)),
	searchResults: state => state.searchResults.map(id => state.bots.find(bot => bot.id === id)),
	getBotById: state => id => state.bots.find(bot => bot.id === id),
	index: state => state.index.map(id => state.bots.find(bot => bot.id === id)),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};