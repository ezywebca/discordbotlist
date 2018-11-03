/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

import hljs from 'highlight.js/lib/highlight';

const hljsLanguages = [
	'java', 'cpp', 'cs', 'css', 'python', 'php', 'javascript',
	'perl', 'ruby', 'powershell', 'lua', 'json', 'bash', 'less', 'markdown', 'scss',
	'sql', 'xml', 'yaml', 'dart'
];

hljsLanguages.forEach((langName) => {
	const langModule = require(`highlight.js/lib/languages/${langName}`);
	hljs.registerLanguage(langName, langModule);
});

export default hljs;