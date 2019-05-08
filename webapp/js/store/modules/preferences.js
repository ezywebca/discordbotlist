/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

import * as types from '../mutation-types';

const state = () => ({
	dataSaverOn: false,
});

const actions = {
	toggleDataSaver: ({commit}, isOn) => {
		document.cookie = `data-saver=${isOn ? 1 : 0}; path=/`;
		commit(types.TOGGLE_DATA_SAVER, isOn);
	},
};

const mutations = {
	[types.TOGGLE_DATA_SAVER](state, isOn) {
		state.dataSaverOn = isOn;
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