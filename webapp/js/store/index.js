import Vue from 'vue';
import Vuex from 'vuex';

import auth from './modules/auth';
import bots from './modules/bots';
import users from './modules/users';
import dbl from './modules/dbl';

Vue.use(Vuex);

const debugging = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
	state: {},
	modules: {
		auth,
		bots,
		users,
		dbl,
	},
	strict: debugging
});

