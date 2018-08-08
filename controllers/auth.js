const models = require('../models');
const axios = require('axios');

const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
const simpleOAuth = require('simple-oauth2');
const _ = require('lodash');

module.exports = {
	login: async (ctx, next) => {
		const code = ctx.request.body.code;

		if (!code)
			throw {status: 422, message: 'Invalid authorization code!'};

		const githubOAuth = simpleOAuth.create({
			client: {
				id: process.env.OAUTH_DISCORD_ID,
				secret: process.env.OAUTH_DISCORD_SECRET,
			},
			auth: {
				tokenHost: 'https://discordapp.com',
				tokenPath: '/api/oauth2/token',
				revokePath: '/api/oauth2/token/revoke',
				authorizePath: '/api/oauth2/authorize',
			}
		});

		const token = await githubOAuth.authorizationCode.getToken({
			redirect_uri: process.env.OAUTH_DISCORD_REDIRECT,
			scope: ['identify'],
			code,
		}).catch(() => {
			throw {status: 422, message: 'Error retrieving Discord data'};
		});

		const discordUser = await getDiscordUser(token.access_token)
			.catch(() => {
				throw {status: 422, message: 'Error retrieving Discord data'};
			});

		let user = await models.user.findOne({
			where: {
				discord_id: discordUser.id
			},
			attributes: ['id', 'discord_id', 'username', 'discriminator', 'avatar', 'admin', 'banned'],
		});

		if (user) {
			if (user.banned) {
				throw {status: 403, message: 'You are banned'};
			} else {
				user.username = discordUser.username;
				user.discriminator = discordUser.discriminator;
				user.avatar = discordUser.avatar;

				await user.save();

				const priv = cryptojs.SHA256(_.pick(user, ['id', 'discord_id', 'banned'])).toString();

				ctx.body = {
					id: user.discord_id,
					username: user.username,
					admin: user.admin,
					expiresIn: 84600 * 90,
					tokenType: 'Bearer',
					token: jwt.sign({
						id: user.id,
						priv,
					}, process.env.JWT_SECRET, {
						expiresIn: '90d'
					}),
				};
			}
		} else {
			const user = await models.user.create({
				discord_id: discordUser.id,
				username: discordUser.username,
				discriminator: discordUser.discriminator,
				avatar: discordUser.avatar,
				banned: false,
				admin: false,
			});

			const priv = cryptojs.SHA256(_.pick(user, ['id', 'discord_id', 'banned'])).toString();

			ctx.body = {
				id: user.discord_id,
				username: user.username,
				admin: user.admin,
				expiresIn: 84600 * 90,
				tokenType: 'Bearer',
				token: jwt.sign({
					id: user.id,
					priv,
				}, process.env.JWT_SECRET, {
					expiresIn: '90d'
				}),
			};
		}
	},
};


async function getDiscordUser(token) {
	return axios.get('https://discordapp.com/api/v6/users/@me', {
		params: {token},
		headers: {
			'Authorization': `Bearer ${token}`
		},
	}).then(response => response.data);
}