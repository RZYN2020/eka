import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer';

const MACOS_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export function launchBrowser() {
	const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
		|| (existsSync(MACOS_CHROME) ? MACOS_CHROME : undefined);

	return puppeteer.launch({
		headless: true,
		executablePath,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
}
