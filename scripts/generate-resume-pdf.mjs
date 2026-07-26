import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './lib/browser.mjs';
import { startStaticServer } from './lib/static-server.mjs';

const DIST_DIR = join(process.cwd(), 'dist');
const PDF_PATH = join(DIST_DIR, 'resume', 'resume.pdf');
const server = await startStaticServer(DIST_DIR);
let browser;

try {
	browser = await launchBrowser();
	const page = await browser.newPage();
	await page.goto(`${server.origin}/resume/print/`, {
		waitUntil: 'networkidle0',
	});
	await page.evaluate(() => document.fonts.ready);
	await mkdir(join(DIST_DIR, 'resume'), { recursive: true });
	await page.pdf({
		path: PDF_PATH,
		format: 'A4',
		printBackground: true,
		preferCSSPageSize: true,
	});
	console.log(`Generated ${PDF_PATH}`);
} finally {
	await browser?.close();
	await server.close();
}
