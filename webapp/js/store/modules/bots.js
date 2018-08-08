import * as types from '../mutation-types';

const state = {
	mine: [],
	hot: [],
	searchResults: [],
	bots: [],
};

const actions = {
	fetchMine: ({commit}) => {
		return axios.get('/api/bots/mine').then(response => {
			commit(types.STORE_MY_BOTS, response.data);
		});
	},

	search: ({commit}, {keywords}) => {
		return axios.get('/api/bots', {
			params: {keywords}
		}).then(response => {
			commit(types.STORE_BOT_SEARCH_RESULTS, response.data);
		});
	},

	fetchHot: ({commit}) => {
		return axios.get('/api/bots').then(response => {
			commit(types.STORE_HOT_BOTS, response.data);
		});
	},
	
	fetch: ({commit}, {id}) => {
		return axios.get('/api/bots/' + id).then(response => {
			commit(types.STORE_BOT, response.data);
		});
	},

	upvote: ({commit}, {id}) => {
		commit(types.UPVOTE_BOT, id);
	}
};

const mutations = {
	[types.STORE_MY_BOTS](state, bots) {
		state.mine = bots;
	},

	[types.STORE_BOT_SEARCH_RESULTS](state, bots) {
		state.searchResults = bots;
	},

	[types.STORE_HOT_BOTS](state, bots) {
		state.hot = bots;
	},

	[types.STORE_BOT](state, bot) {
		state.bots.push(bot);
	},

	[types.UPVOTE_BOT](state, id) {
		let bot = state.bots.filter(bot => bot.id === id)[0];

		Object.assign(bot, {
			upvotes: bot.upvotes + 1,
			is_upvoted: true,
		});
	}
};

const getters = {
	mine: state => state.mine,
	hot: state => state.hot,
	searchResults: state => state.searchResults,
	getBotById: state => id => state.bots.filter(bot => bot.client_id === id)[0],
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};