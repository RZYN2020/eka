import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const MACOS_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
process.env.PUPPETEER_CACHE_DIR ??= join(homedir(), '.pnpm-store', 'puppeteer');

const { default: puppeteer } = await import('puppeteer');

async function getExecutablePath() {
	if (
		process.env.PUPPETEER_EXECUTABLE_PATH
		&& existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)
	) {
		return process.env.PUPPETEER_EXECUTABLE_PATH;
	}

	if (existsSync(MACOS_CHROME)) {
		return MACOS_CHROME;
	}

	try {
		return await puppeteer.executablePath();
	} catch {
		return undefined;
	}
}

export async function ensureBrowser() {
	const executablePath = await getExecutablePath();
	if (executablePath && existsSync(executablePath)) {
		return;
	}

	const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
	await new Promise((resolve, reject) => {
		const child = spawn(command, ['exec', 'puppeteer', 'browsers', 'install', 'chrome'], {
			stdio: 'inherit',
		});
		child.once('error', reject);
		child.once('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Failed to install Chrome (exit code ${code ?? 'unknown'}).`));
			}
		});
	});
}

export async function launchBrowser() {
	return puppeteer.launch({
		headless: true,
		executablePath: await getExecutablePath(),
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
}
