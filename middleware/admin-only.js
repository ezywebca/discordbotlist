module.exports = async (ctx, next) => {
	if (!ctx.state.user || !ctx.state.user.admin)
		throw {status: 403, message: 'Access denied'};

	return next();
};
