import Home from './components/pages/Home';
import Contact from './components/pages/Contact';
import Partners from './components/pages/Partners';
import AuthCallback from './components/pages/AuthCallback';
import MyBots from './components/pages/MyBots';
import Queued from './components/pages/Queued';
import AddBot from './components/pages/AddBot';
import ViewBot from './components/pages/ViewBot';
import EditBot from './components/pages/EditBot';
import UpvoteBot from './components/pages/UpvoteBot';
import ViewUser from './components/pages/ViewUser';
import APIDocs from './components/pages/APIDocs';
import NotFound from './components/pages/NotFound';
import Bots from './components/pages/Bots';
import ApprovalQueue from './components/pages/ApprovalQueue';
import Tags from './components/pages/Tags';
import Tag from './components/pages/Tag';
import DBLConfigurations from './components/pages/DBLConfigurations';

export default [
	{
		name: 'home',
		path: '/',
		component: Home,
	}, {
		name: 'bots',
		path: '/bots',
		component: Bots,
	}, {
		name: 'contact',
		path: '/contact',
		component: Contact,
	}, {
		name: 'partners',
		path: '/partners',
		component: Partners,
	}, {
		name: 'auth-callback',
		path: '/auth/callback',
		component: AuthCallback,
	}, {
		name: 'my-bots',
		path: '/bots/mine',
		component: MyBots,
		meta: {
			requiresAuth: true,
		}
	}, {
		name: 'approval-queue',
		path: '/bots/disapproved',
		component: ApprovalQueue,
		meta: {
			requiresAuth: true,
			requiresRoles: ['approval'],
		}
	}, {
		name: 'dbl-configurations',
		path: '/db/configurations',
		component: DBLConfigurations,
		meta: {
			requiresAuth: true,
			requiresAdmin: true,
		}
	}, {
		name: 'tags',
		path: '/tags',
		component: Tags,
		meta: {
			requiresAuth: true,
			requiresAdmin: true,
		}
	}, {
		name: 'tag',
		path: '/tags/:name',
		component: Tag,
	}, {
		name: 'add-bot',
		path: '/my-bots/add',
		component: AddBot,
		meta: {
			requiresAuth: true,
		}
	}, {
		name: 'queued',
		path: '/my-bots/queued',
		component: Queued,
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
		name: 'not-found',
		path: '/404',
		component: NotFound,
	},
];
