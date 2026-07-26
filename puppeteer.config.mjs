import { homedir } from 'node:os';
import { join } from 'node:path';

/** @type {import('puppeteer').Configuration} */
export default {
	cacheDirectory: join(homedir(), '.pnpm-store', 'puppeteer'),
};
