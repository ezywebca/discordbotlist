import * as types from '../mutation-types';
import root from 'window-or-global';

const state = {
	username: '',
	admin: false,
	accessToken: null,
	expiresIn: 0,
	obtainedAt: 0,
	discordOAuthURL: '',
};

const actions = {
	login: ({commit}, code) => {
		return axios.post('/api/auth/login', {
			code
		}).then(response => {
			const auth = {
				username: response.data.username,
				admin: response.data.admin,
				token: response.data.token,
				expiresIn: response.data.expiresIn * 1000,
				obtainedAt: Date.now(),
			};

			document.cookie = `auth=${JSON.stringify(auth)}; path=/`;
			root.axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

			commit(types.LOGIN, auth);
		});
	},

	logout: ({commit}) => {
		document.cookie = 'auth=; path=/';
		delete root.axios.defaults.headers.common['Authorization'];
		commit(types.LOGOUT);
	}
};

const mutations = {
	[types.LOGIN](state, payload) {
		state.username = payload.username;
		state.admin = payload.admin;
		state.accessToken = payload.token;
		state.expiresIn = payload.expiresIn;
		state.obtainedAt = payload.obtainedAt ? payload.obtainedAt : Date.now();
	},

	[types.LOGOUT](state) {
		state.accessToken = null;
		state.expiresIn = 0;
		state.obtainedAt = 0;
	},

	[types.SET_DISCORD_OAUTH_URL](state, payload) {
		let url =  `https://discordapp.com/api/oauth2/authorize`;
			url += `?client_id=${encodeURIComponent(payload.discordId)}`;
			url += `&redirect_uri=${encodeURIComponent(payload.discordRedirect)}`;
			url += `&response_type=code`;
			url += `&scope=identify%20email`;

		state.discordOAuthURL = url;
	}
};

const getters = {
	isAuthenticated: state => state.accessToken ? ((state.obtainedAt + state.expiresIn > Date.now()) ?
		true :
		false) : false,
	discordOAuthURL: state => state.discordOAuthURL,
	user: state => ({
		username: state.username,
		admin: state.admin
	}),
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};