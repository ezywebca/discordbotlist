import marked from 'marked';
import sanitizeHtml from 'sanitize-html';

const renderer = new marked.Renderer();

function sanitize(thing) {
	return sanitizeHtml(thing, {
		allowedTags: [],
		allowedAttributes: {},
	});
}

renderer.image = function (src, title, alt) {
	const exec = /=\s*(\d*)\s*x\s*(\d*)\s*$/.exec(title);

	let res = '<img src="' + sanitize(src) + '" alt="' + sanitize(alt);

	if (exec && exec[1]) res += '" width="' + exec[1];
	if (exec && exec[2]) res += '" height="' + exec[2];

	return res + '">';
};

marked.setOptions({
	renderer,
});