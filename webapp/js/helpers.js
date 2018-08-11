// https://codebottle.io/s/4e85668754
export function getURLParameter(param) {
	if (window.location.href.endsWith("#"))
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

// https://stackoverflow.com/a/9461657/2164304
export function kFormatter(num) {
	return num > 999 ? (num / 1000).toFixed(1) + 'k' : num
}