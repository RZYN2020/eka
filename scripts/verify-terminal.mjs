import assert from 'node:assert/strict';
import { isTerminalRequest, onRequest } from '../functions/_middleware.js';

const request = (path = '/', userAgent = '') =>
	new Request(`https://yongzhen.space${path}`, {
		headers: { 'User-Agent': userAgent },
	});

assert.equal(isTerminalRequest(request('/', 'curl/8.7.1')), true);
assert.equal(isTerminalRequest(request('/', 'Wget/1.24.5')), true);
assert.equal(isTerminalRequest(request('/', 'Mozilla/5.0')), false);
assert.equal(isTerminalRequest(request('/writing/', 'curl/8.7.1')), false);
assert.equal(isTerminalRequest(request('/terminal/', 'Mozilla/5.0')), true);

let nextCalled = false;
const browserResponse = await onRequest({
	request: request('/', 'Mozilla/5.0'),
	next() {
		nextCalled = true;
		return new Response('<html></html>');
	},
	env: { ASSETS: { fetch: () => new Response('unexpected') } },
});
assert.equal(nextCalled, true);
assert.match(await browserResponse.text(), /html/);

let fetchedPath = '';
const terminalResponse = await onRequest({
	request: request('/', 'curl/8.7.1'),
	next() {
		throw new Error('Terminal requests must not reach the HTML site');
	},
	env: {
		ASSETS: {
			fetch(assetRequest) {
				fetchedPath = new URL(assetRequest.url).pathname;
				return new Response('Eka terminal');
			},
		},
	},
});
assert.equal(fetchedPath, '/terminal.txt');
assert.equal(await terminalResponse.text(), 'Eka terminal');
assert.equal(terminalResponse.headers.get('content-type'), 'text/plain; charset=utf-8');
assert.equal(terminalResponse.headers.get('vary'), 'User-Agent');

console.log('Terminal middleware verification passed.');
