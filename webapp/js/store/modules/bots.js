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

	upvote: ({commit}, {clientId}) => {
		commit(types.UPVOTE_BOT, clientId);
	},

	fetchIndex: ({commit}, {skip}) => {
		return axios.get('/api/bots', {
			params: {skip, all: 1}
		}).then(response => {
			commit(types.STORE_INDEX_BOTS, response.data);
			return response;
		});
	}
};

const mutations = {
	[types.STORE_MY_BOTS](state, bots) {
		state.mine = bots.map(bot => bot.client_id);
		state.bots = unionState(state.bots, bots, 'client_id', 'client_id');
	},

	[types.STORE_BOT_SEARCH_RESULTS](state, bots) {
		state.searchResults = bots.map(bot => bot.client_id);
		state.bots = unionState(state.bots, bots, 'client_id', 'client_id');
	},

	[types.STORE_HOT_BOTS](state, bots) {
		state.hot = bots.map(bot => bot.client_id);
		state.bots = unionState(state.bots, bots, 'client_id', 'client_id');
	},

	[types.STORE_BOT](state, bot) {
		state.bots = unionState(state.bots, [bot], 'client_id', 'client_id');
	},

	[types.UPVOTE_BOT](state, clientId) {
		const bot = state.bots.find(bot => bot.client_id === clientId);
		++bot.upvotes;
		bot.is_upvoted = true;
		
		state.bots = unionState(state.bots, [bot], 'client_id', 'client_id');
	},

	[types.STORE_INDEX_BOTS](state, bots) {
		state.index = [...new Set([
			...state.index,
			...bots.map(bot => bot.client_id)
		])];
		state.bots = unionState(state.bots, bots, 'client_id', 'client_id');
	},
};

const getters = {
	mine: state => state.mine.map(clientId => state.bots.find(bot => bot.client_id === clientId)),
	hot: state => state.hot.map(clientId => state.bots.find(bot => bot.client_id === clientId)),
	searchResults: state => state.searchResults.map(clientId => state.bots.find(bot => bot.client_id === clientId)),
	getBotById: state => id => state.bots.find(bot => bot.client_id === id),
	index: state => state.index.map(clientId => state.bots.find(bot => bot.client_id === clientId)),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};