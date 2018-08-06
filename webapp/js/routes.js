import Home from './components/pages/Home';
import About from './components/pages/About';
import AuthCallback from './components/pages/AuthCallback';
import MyBots from './components/pages/MyBots';
import NotFound from './components/pages/NotFound';

export default [
	{
		name: 'home',
		path: '/',
		component: Home,
	}, {
		name: 'about',
		path: '/about',
		component: About,
	}, {
		name: 'auth-callback',
		path: '/auth/callback',
		component: AuthCallback,
	}, {
		name: 'my-bots',
		path: '/my-bots',
		component: MyBots,
		meta: {
			requiresAuth: true,
		}
	},

	// Error handling

	{
		name: 'NotFound',
		path: '*',
		component: NotFound,
	},
];
