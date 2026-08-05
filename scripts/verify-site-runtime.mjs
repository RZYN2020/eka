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
		const browseMenu = document.querySelector('.mobile-nav-picker');
		const themeToggle = document.querySelector('.theme-toggle');
		return {
			themePreference: document.documentElement.dataset.themePreference,
			navigationLinks: navigation?.querySelectorAll(':scope > a').length,
			browseMenuVisible: browseMenu && getComputedStyle(browseMenu).display !== 'none',
			pageFitsViewport: document.documentElement.scrollWidth <= window.innerWidth,
			themeToggleVisible: themeToggle?.getBoundingClientRect().right <= window.innerWidth,
		};
	});
	assert.equal(homeState.themePreference, 'auto', '首次访问应默认跟随系统主题');
	assert.equal(homeState.navigationLinks, 5, '移动端必须保留全部主导航入口');
	assert(homeState.browseMenuVisible, '移动端必须显示 Browse 折叠菜单');
	assert(homeState.pageFitsViewport, '移动端首页不得产生页面级横向溢出');
	assert(homeState.themeToggleVisible, '移动端主题入口必须保持可见');
	await page.click('.mobile-nav-toggle');
	assert.equal(
		await page.$eval('.mobile-nav-picker', menu => menu.open),
		true,
		'移动端 Browse 菜单必须能够展开',
	);
	assert.equal(
		await page.$$eval('.mobile-nav-menu a', links => links.length),
		3,
		'移动端 Browse 菜单必须包含分类、标签和关于入口',
	);

	await page.setViewport({ width: 320, height: 700, deviceScaleFactor: 1 });
	await page.goto(`${server.origin}/about/`, { waitUntil: 'domcontentloaded' });
	await page.click('.mobile-nav-toggle');
	const narrowHeaderState = await page.evaluate(() => {
		const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
		const overlaps = (first, second) => Boolean(first && second
			&& first.left < second.right
			&& first.right > second.left
			&& first.top < second.bottom
			&& first.bottom > second.top);
		const about = [...document.querySelectorAll('.mobile-nav-menu a')]
			.find((link) => link.textContent?.trim() === 'About')
			?.getBoundingClientRect();
		const search = rect('.social-nav a');
		const theme = rect('.theme-toggle');
		return {
			pageFitsViewport: document.documentElement.scrollWidth <= window.innerWidth,
			aboutOverlapsSearch: overlaps(about, search),
			aboutOverlapsTheme: overlaps(about, theme),
			searchOverlapsTheme: overlaps(search, theme),
		};
	});
	assert(narrowHeaderState.pageFitsViewport, '320px 页头不得产生页面级横向溢出');
	assert(!narrowHeaderState.aboutOverlapsSearch, 'About 菜单项不得与 Search 重合');
	assert(!narrowHeaderState.aboutOverlapsTheme, 'About 菜单项不得与主题入口重合');
	assert(!narrowHeaderState.searchOverlapsTheme, 'Search 不得与主题入口重合');

	await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
	await page.goto(server.origin, { waitUntil: 'domcontentloaded' });

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
