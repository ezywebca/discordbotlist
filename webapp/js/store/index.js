/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

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
