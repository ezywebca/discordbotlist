const Router = require('koa-router');
const router = new Router();
const compose = require('koa-compose');

const jwt = require('koa-jwt');
const auth = require('./middleware/auth');
const throttle = require('./middleware/throttle');
const denyBanned = require('./middleware/deny-banned');
const adminOnly = require('./middleware/admin-only');

const AuthController = require('./controllers/auth');
const BotController = require('./controllers/bot');
const UserController = require('./controllers/user');

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
	router.post('/api/bots', throttle(2, 900, true), protect(), BotController.add);
	router.get('/api/bots/mine', throttle(), protect(), BotController.getMine);
	router.get('/api/bots/:id', throttle(), protect(true), BotController.get);
	router.put('/api/bots/:id', throttle(), protect(), BotController.edit);
	router.delete('/api/bots/:id', throttle(), protect(), BotController.delete);
	router.get('/api/bots/:id/token', throttle(), protect(), BotController.generateToken);
	router.get('/api/bots/:id/upvotes', throttle(), BotController.getUpvotes);
	router.post('/api/bots/:id/refresh', throttle(), protect(), adminOnly, BotController.refresh);
	router.post('/api/bots/:id/upvotes', throttle(), protect(), BotController.upvote);
	router.post('/api/bots/:id/stats', throttle(), BotController.updateStats); // Token-based authentication inside controller
	router.delete('/api/bots/:id/stats', throttle(2, 900, true), BotController.resetStats); // same
	
	router.get('/api/users/:id', throttle(), UserController.get);
	router.post('/api/users/:id/ban', throttle(), protect(), adminOnly, UserController.ban);
	router.delete('/api/users/:id/ban', throttle(), protect(), adminOnly, UserController.unban);
	router.post('/api/users/:id/refresh', throttle(), protect(), adminOnly, UserController.refresh);

	return router;
};
