import * as types from '../mutation-types';

const state = {
	users: [],
};

const actions = {
	fetch: ({commit}, {id}) => {
		return axios.get('/api/users/' + id).then(response => {
			commit(types.STORE_USER, response.data);
		});
	}
};

const mutations = {
	[types.STORE_USER](state, bot) {
		state.users.push(bot);
	}
};

const getters = {
	getUserById: state => id => state.users.filter(user => user.id === id)[0],
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};