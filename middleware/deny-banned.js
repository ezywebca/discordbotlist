module.exports = async (ctx, next) => {
	if (ctx.state.user && ctx.state.user.banned)
		throw {status: 403, message: 'You have been banned'};

	return next();
};
