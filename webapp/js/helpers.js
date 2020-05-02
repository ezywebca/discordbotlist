import hljs from './hljs';
import {getStore} from './store';

// https://codebottle.io/s/4e85668754
export function getURLParameter(param) {
	if (window.location.href.endsWith('#'))
		window.location.href = window.location.href.substr(0, window.location.href.length - 1);
	var vars = {};
	window.location.href.replace(location.hash, '').replace(
		/[?&]+([^=&]+)=?([^&]*)?/gi,
		function (m, key, value) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);
	if (param)
		return vars[param] ? vars[param] : null;
	return vars;
}

export function generateRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function extractError(error) {
	if (error.response)
		if (!error.response.data || !error.response.data.error)
			return 'Internal error!';
		else {
			if (error.response.status == 429 && error.response.headers['retry-after'])
				return 'Try again ' + moment().add(error.response.headers['retry-after'] * 1000).fromNow();
			else return error.response.data.error;
		}
	else
		return 'Network error!';
}

// https://codebottle.io/s/61ca238092
export function formatNumber(num) {
	if (num > 999999999)
		return `${(num/1e9).toFixed(1)}B`;
	if (num > 999999)
		return `${(num/1e6).toFixed(1)}M`;
	if (num > 999)
		return `${(num/1e3).toFixed(1)}K`;

	return `${num}`; // returned type consistency
}

export function getAvatar(entity) {
	const dataSaving = getStore().state.preferences.dataSaverOn;

	if (entity.avatar)
		return `https://cdn.discordapp.com/avatars/${entity.id}/${entity.avatar}.png?size=${dataSaving ? 128 : 512}`;
	else
		return `https://cdn.discordapp.com/embed/avatars/${entity.discriminator % 5}.png`;
}

export function highlightCode() {
	document.querySelectorAll('pre code:not(.hljs)').forEach(b => {
		if (b.classList.contains('lang-text') || b.classList.length === 0)
			b.classList.add('hljs', 'no-highlight');
		hljs.highlightBlock(b);
	});
}

export function kindaEquals(a, b) {
	const lowercase = {
		a: a.toLowerCase(),
		b: b.toLowerCase(),
	};

	return lowercase.a === lowercase.b
		|| lowercase.a.replace(/-/g, ' ') === lowercase.b
		|| lowercase.b.replace(/-/g, ' ') === lowercase.a;
}

export function desanitizeTag(tag) {
	return tag.replace(/-/g, ' ');
}

export function sanitizeTag(tag) {
	return tag.replace(/\s/g, '-').toLowerCase();
}

export function getCookie(name) {
	var value = '; ' + document.cookie;
	var parts = value.split('; ' + name + '=');
	if (parts.length == 2) return parts.pop().split(';').shift();
}

// i copied this and i have 0 clue what it does
export function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}