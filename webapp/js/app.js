'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
import VueOnToast from 'vue-on-toast';
import VueAnalytics from 'vue-analytics';
import App from './components/App';
import axios from 'axios';
import root from 'window-or-global';

import routes from './routes';
import store from './store';

root.axios = axios;

if (!root.serverRendering)
	Vue.use(require('vue-infinite-scroll'));

Vue.use(VueMeta, {
	keyName: 'meta',
});

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueOnToast);

if (typeof (window) !== 'undefined' && window.__INITIAL_STATE__)
	store.replaceState(window.__INITIAL_STATE__);

root.axios.interceptors.response.use(response => response, error => {
	if (error && error.response && error.response.status === 401 && store.getters['auth/isAuthenticated']) {
		store.dispatch('auth/logout');
	}

	return Promise.reject(error);
});

const router = new VueRouter({
	mode: 'history',
	linkActiveClass: 'active',
	routes,
	scrollBehavior: () => ({x: 0, y: 0}),
});

router.beforeEach((to, from, next) => {
	if (to.meta.requiresAuth && !store.getters['auth/isAuthenticated']) {
		if (from.name) {
			VueOnToast.ToastService.pop('error', 'Sign in first!');
		} else {
			next({name: 'home'})
		}
	} else if (to.name === 'auth-callback' && store.getters['auth/isAuthenticated']) {
		if (from.name) {
			VueOnToast.ToastService.pop('error', 'You are already signed in!');
		} else {
			next({name: 'home'})
		}
	} else next();
});

if (process.env.NODE_ENV === 'production')
	Vue.use(VueAnalytics, {
		id: 'UA-80585608-2',
		router,
	});

export function createApp() {
	const app = new Vue({
		render: h => h(App),
		router,
		store,
	});

	return {
		app,
		router,
		store
	};
}
