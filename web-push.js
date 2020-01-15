const webPush = require('web-push');
const models = require('./models');

webPush.setVapidDetails(
	'mailto:support@discordbotlist.com',
	process.env.VAPID_PUBLIC,
	process.env.VAPID_PRIVATE,
);

async function isUserSubscribed(id) {
	const pushSubscription = await models.pushSubscription.findOne({
		where: {
			user_id: id,
		}
	});

	return !!pushSubscription;
}

async function sendUser(id, data) {
	const pushSubscriptions = await models.pushSubscription.findAll({
		where: {
			user_id: id,
		}
	});

	if (pushSubscriptions.length < 1)
		throw new Error('User has no subscriptions');

	const promises = [];

	for (const subscription of pushSubscriptions)
		promises.push(webPush.sendNotification({
			endpoint: subscription.endpoint,
			keys: {
				p256dh: subscription.p256dh,
				auth: subscription.auth,
			},
		}, data));

	return Promise.all(promises);
}

module.exports = {
	isUserSubscribed,
	sendUser,
};