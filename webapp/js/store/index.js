import Vuex from 'vuex';

import auth from './modules/auth';
import bots from './modules/bots';
import users from './modules/users';
import tags from './modules/tags';
import dbl from './modules/dbl';
import preferences from './modules/preferences';

const debugging = process.env.NODE_ENV !== 'production';

let store = null;

export function createStore() {
	store = new Vuex.Store({
		state: {},
		modules: {
			auth,
			bots,
			users,
			tags,
			dbl,
			preferences,
		},
		strict: debugging
	});

	return store;
}

export function getStore() {
	return store;
}