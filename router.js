const Router = require('koa-router');
const router = new Router();
const compose = require('koa-compose');

const jwt = require('koa-jwt');
const auth = require('./middleware/auth');
const throttle = require('./middleware/throttle');
const denyBanned = require('./middleware/deny-banned');
const adminOnly = require('./middleware/adminOnly');

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
	router.delete('/api/bots/:id', throttle(), protect(), BotController.delete);
	router.post('/api/bots/:id/upvote', throttle(), protect(), BotController.upvote);
	
	router.get('/api/users/:id', throttle(), UserController.get);
	router.post('/api/users/:id/ban', throttle(), protect(), adminOnly, UserController.ban);
	router.delete('/api/users/:id/ban', throttle(), protect(), adminOnly, UserController.unban);

	return router;
};
