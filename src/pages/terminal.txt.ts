import { getCollection } from 'astro:content';
import { renderTerminal } from '../lib/terminal';

export async function GET() {
	const entries = await getCollection('writing');

	return new Response(renderTerminal(entries), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=0, must-revalidate',
			'X-Content-Type-Options': 'nosniff',
		},
	});
}
