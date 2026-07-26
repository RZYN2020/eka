import assert from 'node:assert/strict';
import { join } from 'node:path';
import { launchBrowser } from './lib/browser.mjs';
import { startStaticServer } from './lib/static-server.mjs';

const server = await startStaticServer(join(process.cwd(), 'dist'));
let browser;

try {
	browser = await launchBrowser();
	const page = await browser.newPage();
	const runtimeErrors = [];
	page.on('pageerror', (error) => runtimeErrors.push(error.message));
	await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });

	await page.goto(server.origin, { waitUntil: 'domcontentloaded' });
	await page.evaluate(() => localStorage.clear());
	await page.reload({ waitUntil: 'domcontentloaded' });

	const homeState = await page.evaluate(() => {
		const navigation = document.querySelector('.main-nav');
		const themeToggle = document.querySelector('.theme-toggle');
		return {
			themePreference: document.documentElement.dataset.themePreference,
			navigationLinks: navigation?.querySelectorAll('a').length,
			navigationOverflow: navigation && getComputedStyle(navigation).overflowX,
			pageFitsViewport: document.documentElement.scrollWidth <= window.innerWidth,
			themeToggleVisible: themeToggle?.getBoundingClientRect().right <= window.innerWidth,
		};
	});
	assert.equal(homeState.themePreference, 'auto', '首次访问应默认跟随系统主题');
	assert.equal(homeState.navigationLinks, 5, '移动端必须保留全部主导航入口');
	assert.equal(homeState.navigationOverflow, 'auto', '移动端主导航应允许横向滚动');
	assert(homeState.pageFitsViewport, '移动端首页不得产生页面级横向溢出');
	assert(homeState.themeToggleVisible, '移动端主题入口必须保持可见');

	await page.click('.theme-toggle');
	await page.click('[data-theme-value="dark"]');
	assert.deepEqual(
		await page.evaluate(() => ({
			preference: document.documentElement.dataset.themePreference,
			theme: document.documentElement.dataset.theme,
			themeColor: document.querySelector('meta[name="theme-color"]')?.content,
		})),
		{ preference: 'dark', theme: 'dark', themeColor: '#1e1e1e' },
		'主题菜单应同步文档主题和浏览器主题色',
	);

	await page.goto(`${server.origin}/search/`, { waitUntil: 'domcontentloaded' });
	await page.type('#search-input', '庐山');
	await page.waitForFunction(() => document.querySelectorAll('#search-results .content-row').length === 1);
	assert.equal(
		await page.$eval('#search-results h2', (heading) => heading.textContent),
		'庐山游记',
		'搜索应安全渲染匹配结果',
	);

	await page.goto(`${server.origin}/media/`, { waitUntil: 'domcontentloaded' });
	assert(
		await page.$$eval('.media-card:not([hidden])', (cards) => cards.length > 0),
		'Media 首屏应选择一个实际有内容的状态与分类组合',
	);

	await page.goto(`${server.origin}/map/`, { waitUntil: 'domcontentloaded' });
	await page.waitForSelector('.leaflet-marker-icon', { timeout: 15_000 });
	assert(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
		'移动端地图不得产生页面级横向溢出',
	);
	assert.equal(
		await page.$eval('#sidebarCol', (sidebar) => getComputedStyle(sidebar).display),
		'none',
		'移动端时间线默认应收起',
	);
	await page.click('#btnMob');
	assert.equal(await page.$eval('#btnMob', (button) => button.getAttribute('aria-expanded')), 'true');
	assert.notEqual(
		await page.$eval('#sidebarCol', (sidebar) => getComputedStyle(sidebar).display),
		'none',
		'移动端列表按钮应打开时间线',
	);

	assert.deepEqual(runtimeErrors, [], `页面运行时不应抛出错误：${runtimeErrors.join('; ')}`);
	console.log('Site runtime verification passed for mobile navigation, themes, search, media, and map.');
} finally {
	await browser?.close();
	await server.close();
}
