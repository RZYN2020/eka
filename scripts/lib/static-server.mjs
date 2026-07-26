import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const mimeTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
};

function resolveRequestPath(root, url = '/') {
	const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
	const relative = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
	const requested = join(root, relative);
	return extname(requested) ? requested : join(requested, 'index.html');
}

export async function startStaticServer(root) {
	const server = createServer(async (request, response) => {
		try {
			const filePath = resolveRequestPath(root, request.url);
			const body = await readFile(filePath);
			response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
			response.end(body);
		} catch {
			response.writeHead(404);
			response.end('Not found');
		}
	});

	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	const address = server.address();

	return {
		origin: `http://127.0.0.1:${address.port}`,
		close: () => new Promise(resolve => server.close(resolve)),
	};
}
