/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

const colors = require('colors/safe');
const stackTrace = require('stack-trace');
const path = require('path');
const fs = require('pn/fs');
const debounce = require('lodash.debounce');
const nodeCleanup = require('node-cleanup');

// This is used for logs that occur before the log file has initialized.
// This gets flushed to the log file once it has initialized.
let tempLog = [];

let diskLogger;

fs.mkdir(path.join(__dirname, 'logs'), {
	recursive: true,
}).then(async () => {
	const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
	const stream = await fs.createWriteStream(path.join(__dirname, 'logs', filename));

	stream.cork();

	const flush = debounce(() => {
		process.nextTick(() => {
			stream.uncork();
			stream.cork();
		});
	}, 15000, { maxWait: 60000 });

	const log = message => {
		stream.write(message + '\n');
		flush();
	};

	nodeCleanup(() => {
		stream.uncork();
	});

	diskLogger = {log};

	for (let line of tempLog)
		diskLogger.log(line);

	tempLog = false;
}).catch(e => {
	log('err', `Error opening disk log file: ${e.stack}`);

	// important to stop tempLog from getting filled up
	tempLog = false;
});


/* istanbul ignore next */
function log(type, message) {
	if (process.env.LOGGING === 'false')
		return;

	var generated = (new Date()).toISOString() + ' ';

	const trace = stackTrace.get();
	const root = path.dirname(__dirname);

	const caller = `.${(trace[2] || trace[1]).getFileName().substring(root.length)}:${(trace[2] || trace[1]).getLineNumber()}`;

	switch (type) {
	case 'info':
		generated += colors.black.bgBlue(' INFO ') + ' ' + colors.white(message);
		break;
	case 'err':
		generated += colors.black.bgRed(' ERR  ') + ' ' + colors.yellow(message);
		break;
	case 'warn':
		generated += colors.black.bgYellow(' WARN ') + ' ' + colors.red(message);
		break;
	case 'recv':
		generated += colors.black.bgGreen(' RECV ') + ' ' + colors.white(message);
		break;
	case 'sql':
		generated += colors.black.bgBlue(' SQL  ') + ' ' + colors.white(message);
		break;
	default:
		generated += colors.black.bgBlue(' INFO ') + ' ' + colors.white(message);
		break;
	}

	generated += ' ' + colors.italic(colors.grey(caller));

	if (diskLogger)
		diskLogger.log(generated);
	else if (tempLog)
		tempLog.push(generated);

	console.log(generated);
}

/* istanbul ignore next */
module.exports = {
	info: (m) => log('info', m),
	err: (m) => log('err', m),
	warn: (m) => log('warn', m),
	recv: (m) => log('recv', m),
	sql: (m) => log('sql', m),
};
