module.exports = async (ctx, next) => {
	ctx.ip = ctx.request.headers['cf-connecting-ip'] || ctx.ip;
	return next();
};
