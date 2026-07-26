const TERMINAL_CLIENT_PATTERN = /(?:^|[\s/])(curl|wget|httpie|xh)(?:[\s/]|$)/i;
const TERMINAL_PATHS = new Set(['/terminal', '/terminal/', '/terminal.txt']);

export function isTerminalRequest(request) {
	const url = new URL(request.url);
	if (TERMINAL_PATHS.has(url.pathname)) return true;
	if (url.pathname !== '/') return false;

	return TERMINAL_CLIENT_PATTERN.test(request.headers.get('user-agent') ?? '');
}

export async function onRequest(context) {
	if (!isTerminalRequest(context.request)) return context.next();

	const assetUrl = new URL('/terminal.txt', context.request.url);
	const assetRequest = new Request(assetUrl, context.request);
	const response = await context.env.ASSETS.fetch(assetRequest);
	const headers = new Headers(response.headers);
	headers.set('Content-Type', 'text/plain; charset=utf-8');
	headers.set('Vary', 'User-Agent');
	headers.set('X-Content-Type-Options', 'nosniff');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
