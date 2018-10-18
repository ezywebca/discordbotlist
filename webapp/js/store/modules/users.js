import * as types from '../mutation-types';
import {unionState} from '../helpers';

const state = () => ({
	users: [],
});

const actions = {
	fetch: ({commit}, {id}) => {
		return axios.get('/api/users/' + id).then(response => {
			commit(types.STORE_USER, response.data);
		});
	}
};

const mutations = {
	[types.STORE_USER](state, user) {
		state.users = unionState(state.users, [user]);
	}
};

const getters = {
	getUserById: state => id => state.users.find(user => user.id === id),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};