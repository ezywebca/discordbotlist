/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

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