import Vuex from 'vuex';

import auth from './modules/auth';
import bots from './modules/bots';
import users from './modules/users';
import dbl from './modules/dbl';

const debugging = process.env.NODE_ENV !== 'production';

export function createStore() {
	return new Vuex.Store({
		state: {},
		modules: {
			auth,
			bots,
			users,
			dbl,
		},
		strict: debugging
	});
}
