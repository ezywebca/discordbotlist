import * as types from '../mutation-types';
import {unionState} from '../helpers';
import {kindaEquals} from '../../helpers';

const state = () => ({
	tags: [],
});

const actions = {
	fetchAll: ({commit}) => {
		return axios.get('/api/tags').then(response => {
			commit(types.STORE_TAGS, response.data);
			return response;
		});
	},

	fetch: ({commit}, {name}) => {
		return axios.get(`/api/tags/${name}`).then(response => {
			commit(types.STORE_TAG, response.data);
			return response;
		});
	},

	create: ({commit}, {name}) => {
		return axios.post('/api/tags', {name}).then(response => {
			commit(types.STORE_TAG, response.data);
			return response;
		});
	},

	delete: ({commit}, {name}) => {
		return axios.delete(`/api/tags/${name}`).then(() => {
			commit(types.DELETE_TAG, name);
		});
	},

	fetchBots: ({commit}, {name, skip}) => {
		return axios.get(`/api/tags/${name}/bots`, {
			params: {skip},
		}).then(response => {
			commit(types.STORE_TAG_BOTS, {
				name,
				bots: response.data
			});
			return response;
		});
	}
};

const mutations = {
	[types.STORE_TAGS](state, tags) {
		state.tags = unionState(state.tags, tags);
	},

	[types.STORE_TAG](state, tag) {
		state.tags = unionState(state.tags, [tag], 'name', 'name');
	},

	[types.DELETE_TAG](state, name) {
		state.tags = state.tags.filter(tag => tag.name.toLowerCase() !== name.toLowerCase());
	},

	[types.STORE_TAG_BOTS](state, {name, bots}) {
		const tag = state.tags.find(tag => kindaEquals(tag.name, name));
		tag.bots = unionState(tag.bots || [], bots);
	}
};

const getters = {
	getTagByName: state => name => state.tags.find(tag => kindaEquals(tag.name, name)),
	getTagBots: state => name => {
		const tag = state.tags.find(tag => kindaEquals(tag.name, name));
		return (tag && tag.bots) || [];
	},
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};