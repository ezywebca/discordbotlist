/* Copyright (C) 2020 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */


self.addEventListener('push', function(event) {
	if (event.data) {
		const json = event.data.json();

		self.registration.showNotification('DiscordBotList', {
			body: `You can now vote for ${json.bot.username} again on discordbotlist.com`,
			icon: json.bot.avatar_url,
			actions: [
				{ action: 'upvote', title: 'Upvote now' },
				{ action: 'ignore', title: 'Not now' }
			],

			data: json,
		});
	}
});

self.addEventListener('notificationclick', function(event) {
	event.notification.close();
	console.log(event.notification);

	if (event.action === 'upvote') {
		clients.openWindow(`https://discordbotlist.com/bots/${event.notification.data.bot.id}/upvote`);
	}
}, false);