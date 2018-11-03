/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

import * as types from '../mutation-types';

const state = () => ({
	config: {},
});

const actions = {
	fetchConfig: ({commit}) => {
		return axios.get('/api/dbl/configurations').then(response => {
			commit(types.STORE_DBL_CONFIG, response.data);
			return response;
		});
	},

	lockDB: ({commit}) => {
		return axios.post('/api/dbl/db-lock').then(response => {
			commit(types.STORE_DBL_DB_LOCK, true);
			return response;
		});
	},

	unlockDB: ({commit}) => {
		return axios.delete('/api/dbl/db-lock').then(response => {
			commit(types.STORE_DBL_DB_LOCK, false);
			return response;
		});
	},
};

const mutations = {
	[types.STORE_DBL_CONFIG](state, config) {
		state.config = config;
	},

	[types.STORE_DBL_DB_LOCK](state, locked) {
		state.config.db_locked = !!locked;
	},
};

const getters = {
	
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};