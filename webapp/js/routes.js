import Home from './components/pages/Home';
import About from './components/pages/About';
import AuthCallback from './components/pages/AuthCallback';
import MyBots from './components/pages/MyBots';
import AddBot from './components/pages/AddBot';
import ViewBot from './components/pages/ViewBot';
import EditBot from './components/pages/EditBot';
import UpvoteBot from './components/pages/UpvoteBot';
import ViewUser from './components/pages/ViewUser';
import APIDocs from './components/pages/APIDocs';
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
	}, {
		name: 'add-bot',
		path: '/my-bots/add',
		component: AddBot,
		meta: {
			requiresAuth: true,
		}
	}, {
		name: 'view-bot',
		path: '/bots/:id',
		component: ViewBot,
	}, {
		name: 'edit-bot',
		path: '/bots/:id/edit',
		component: EditBot,
	}, {
		name: 'upvote-bot',
		path: '/bots/:id/upvote',
		component: UpvoteBot,
	}, {
		name: 'view-user',
		path: '/users/:id',
		component: ViewUser,
	}, {
		name: 'api-docs',
		path: '/api-docs',
		component: APIDocs,
	},

	// Error handling

	{
		name: 'NotFound',
		path: '*',
		component: NotFound,
	},
];
