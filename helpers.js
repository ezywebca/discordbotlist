const dns = require('dns');

async function isCrawler(ip) {
	return await isDdgBot(ip) ||
		await isGoogleBot(ip) ||
		await isBingBot(ip);
}

async function isDdgBot(ip) {
	return [
		'72.94.249.34',
		'72.94.249.35',
		'72.94.249.36',
		'72.94.249.37',
		'72.94.249.38',
	].indexOf(ip) !== -1;
}


async function isGoogleBot(ip) {
	return new Promise((resolve, reject) => {
		dns.reverse(ip, (err, hosts) => {
			if (err) {
				if (err.code === 'ENOTFOUND') {
					resolve(false);
				} else {
					reject(err);
				}
			} else {
				const host = hosts[0];

				if (!host || !(host.endsWith('.googlebot.com') || host.endsWith('.google.com'))) {
					resolve(false);
				} else {
					dns.lookup(host, (err, addr) => {
						if (err)
							reject(err);
						else
							resolve(addr === ip);
					});
				}
			}
		});
	});
}

async function isBingBot(ip) {
	return new Promise((resolve, reject) => {
		dns.reverse(ip, (err, hosts) => {
			if (err) {
				if (err.code === 'ENOTFOUND') {
					return resolve(false);
				} else {
					return reject(err);
				}
			} else {
				const host = hosts[0];

				if (!host || !host.endsWith('search.msn.com')) {
					resolve(false);
				} else {
					dns.lookup(host, (err, addr) => {
						if (err)
							reject(err);
						else
							resolve(addr === ip);
					});
				}
			}
		});
	});
}

module.exports = {
	isCrawler,
	isGoogleBot,
	isBingBot,
	isDdgBot,
};