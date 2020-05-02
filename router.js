const Router = require('koa-router');
const router = new Router();
const compose = require('koa-compose');

const jwt = require('koa-jwt');
const auth = require('./middleware/auth');
const throttle = require('./middleware/throttle');
const denyBanned = require('./middleware/deny-banned');
const adminOnly = require('./middleware/admin-only');
const checkDBLock = require('./middleware/check-db-lock');
const hasRole = require('./middleware/has-role');

const AuthController = require('./controllers/auth');
const BotController = require('./controllers/bot');
const UserController = require('./controllers/user');
const TagController = require('./controllers/tag');
const DBLController = require('./controllers/dbl');
const PushSubscriptionsController = require('./controllers/push-subscription');

const protect = (passthrough = false) => {
	return compose([
		jwt({
			secret: process.env.JWT_SECRET,
			passthrough
		}),
		auth(passthrough),
		denyBanned,
	]);
};

module.exports = () => {
	router.post('/api/auth/login', throttle(5, 120), AuthController.login);

	router.get('/api/bots', throttle(), protect(true), BotController.index);
	router.get('/api/bots/disapproved', throttle(), protect(), hasRole('approval'), BotController.getDisapproved);
	router.post('/api/bots/disapproved/:id/approve', throttle(), protect(), hasRole('approval'), BotController.approve);
	router.post('/api/bots/disapproved/:id/deny', throttle(), protect(), hasRole('approval'), BotController.deny);

	router.post('/api/bots', throttle(2, 900, true), protect(), checkDBLock, BotController.add);
	router.get('/api/bots/mine', throttle(), protect(), BotController.getMine);
	router.get('/api/bots/:id', throttle(), protect(true), BotController.get);
	router.put('/api/bots/:id', throttle(), protect(), checkDBLock, BotController.edit);
	router.delete('/api/bots/:id', throttle(), protect(), checkDBLock, BotController.delete);
	router.get('/api/bots/:id/token', throttle(), protect(), checkDBLock, BotController.generateToken);
	router.post('/api/bots/:id/refresh', throttle(), protect(), checkDBLock, adminOnly, BotController.refresh);
	router.post('/api/bots/:id/upvotes', throttle(), protect(), checkDBLock, BotController.upvote);

	router.post('/api/bots/:id/nsfw-mark', throttle(), protect(), checkDBLock, BotController.setNSFW);
	router.delete('/api/bots/:id/nsfw-mark', throttle(), protect(), checkDBLock, BotController.unsetNSFW);

	router.post('/api/bots/:id/upvotes/webhook-test', throttle(10, 60), protect(), checkDBLock, BotController.testWebhook);

	router.post('/api/bots/:id/verification', throttle(), protect(), checkDBLock, adminOnly, BotController.verify);
	router.delete('/api/bots/:id/verification', throttle(), protect(), checkDBLock, adminOnly, BotController.unverify);

	router.post('/api/bots/:id/stats', throttle(1000), checkDBLock, BotController.updateStats); // Token-based authentication inside controller
	router.delete('/api/bots/:id/stats', throttle(), checkDBLock, BotController.resetStats); // same

	router.get('/api/users/:id', throttle(), UserController.get);
	router.post('/api/users/:id/ban', throttle(), protect(), checkDBLock, adminOnly, UserController.ban);
	router.delete('/api/users/:id/ban', throttle(), protect(), checkDBLock, adminOnly, UserController.unban);
	router.post('/api/users/:id/refresh', throttle(), protect(), checkDBLock, adminOnly, UserController.refresh);
	router.post('/api/users/:id/refresh', throttle(), protect(), checkDBLock, adminOnly, UserController.refresh);

	router.get('/api/dbl/configurations', throttle(), protect(), adminOnly, DBLController.getConfig);
	router.post('/api/dbl/db-lock', throttle(), protect(), adminOnly, DBLController.lockDB);
	router.delete('/api/dbl/db-lock', throttle(), protect(), adminOnly, DBLController.unlockDB);
	router.get('/api/dbl/approval-delay', throttle(), DBLController.getApprovalDelay);

	router.get('/api/tags', throttle(), TagController.getAll);
	router.post('/api/tags', throttle(), protect(), checkDBLock, adminOnly, TagController.create);
	router.get('/api/tags/:name', throttle(), TagController.get);
	router.delete('/api/tags/:name', throttle(), protect(), checkDBLock, adminOnly, TagController.delete);
	router.get('/api/tags/:name/bots', throttle(), protect(true), TagController.getBots);

	router.post('/api/push-subscriptions', throttle(), protect(), PushSubscriptionsController.subscribe);

	return router;
};
