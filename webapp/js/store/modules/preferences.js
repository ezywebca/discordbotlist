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