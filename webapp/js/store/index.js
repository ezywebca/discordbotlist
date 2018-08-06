import Vue from 'vue';
import Vuex from 'vuex';

import auth from './modules/auth';

Vue.use(Vuex);

const debugging = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
	state: {},
	modules: {
		auth,
	},
	strict: debugging
});

