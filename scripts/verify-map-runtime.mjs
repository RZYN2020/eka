import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { bases } from '../src/data/travel.js';
import { launchBrowser } from './lib/browser.mjs';
import { startStaticServer } from './lib/static-server.mjs';

const DIST_DIR = join(process.cwd(), 'dist');
const places = [];
function collectPlaces(nodes) {
	nodes.forEach(node => {
		places.push(node);
		collectPlaces(node.children || []);
	});
}
collectPlaces(bases);
const expectedTimelineMarkers = {
	phases: places.filter(({ kind }) => kind === 'phase').length,
	stays: places.filter(({ kind }) => kind === 'stay').length,
	visits: places.filter(({ kind }) => kind === 'visit').length,
};
const server = await startStaticServer(DIST_DIR);
let browser;

try {
	browser = await launchBrowser();
	const page = await browser.newPage();
	const geoRequests = [];
	page.on('request', request => {
		const pathname = new URL(request.url()).pathname;
		if (pathname.startsWith('/geojson/')) geoRequests.push(pathname);
	});
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
	await page.goto(`${server.origin}/map/`, { waitUntil: 'domcontentloaded' });
	await page.waitForSelector('.leaflet-marker-icon', { timeout: 15_000 });
	assert.deepEqual(
		geoRequests,
		['/geojson/china-cities.json'],
		'地图首屏只应加载默认城市视图，省份和世界数据必须按需加载',
	);

	const markerLayout = await page.evaluate(() => {
		const map = document.getElementById('map').getBoundingClientRect();
		const markers = [...document.querySelectorAll('.leaflet-marker-icon')].map(marker => {
			const rect = marker.getBoundingClientRect();
			return {
				x: Math.round(rect.left - map.left),
				y: Math.round(rect.top - map.top),
				width: rect.width,
				height: rect.height,
			};
		});
		return { map: { width: map.width, height: map.height }, markers };
	});

	assert(markerLayout.markers.length >= 30, '应渲染全部已访问地点的 Marker');
	assert(
		markerLayout.markers.every(marker => Number.isFinite(marker.x) && Number.isFinite(marker.y)),
		'所有 Marker 都应具有有效的屏幕坐标',
	);
	const topLeftPile = markerLayout.markers.filter(marker => marker.x <= 2 && marker.y <= 2);
	assert.equal(topLeftPile.length, 0, 'Marker 不应堆积在地图左上角');
	assert(
		new Set(markerLayout.markers.map(marker => `${marker.x}:${marker.y}`)).size >= 25,
		'不同城市的 Marker 应分布在地图上',
	);
	await page.$eval('.tl-trip', item => {
		item.dispatchEvent(new MouseEvent('mouseenter'));
	});
	const hoveredMarkerState = await page.evaluate(() =>
		[...document.querySelectorAll('.leaflet-marker-icon')].map(marker => ({
			transform: marker.style.transform,
			transition: marker.style.transition,
		})),
	);
	assert(
		hoveredMarkerState.every(({ transform }) => transform.includes('translate3d') && !transform.includes('scale')),
		'悬停强调不得覆盖 Leaflet Marker 的 translate3d 定位',
	);
	assert(
		hoveredMarkerState.every(({ transition }) => !transition.includes('transform')),
		'Marker 外层不得残留会导致缩放延迟的 transform transition',
	);
	assert.equal(await page.title(), '人生足迹 · Eka');
	assert.equal(await page.$eval('.topbar h1', heading => heading.textContent), '人生足迹');
	assert.equal(await page.$eval('#map', map => map.tabIndex), 0, 'Leaflet 地图必须保持原生键盘焦点');
	await page.$eval('.tl-trip', item => {
		item.dispatchEvent(new MouseEvent('mouseleave'));
	});
	const initialZoom = await page.evaluate(() => Math.max(
		...[...document.querySelectorAll('.leaflet-tile')]
			.map(tile => Number(tile.src.match(/\/(\d+)\/\d+\/\d+\.png/)?.[1]))
			.filter(Number.isFinite),
	));

	await page.focus('.tl-base');
	await page.keyboard.press('Enter');
	await page.waitForFunction(() => document.querySelector('.tl-base')?.classList.contains('sel'));
	await page.evaluate(() => {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
	});
	await page.keyboard.press('KeyJ');
	await page.waitForSelector('.journey-avatar', { timeout: 5_000 });
	await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '庆阳');
	await page.waitForSelector('#journeyTimeline:not([hidden])');
	await page.keyboard.press('Space');
	assert.equal(
		await page.$eval('#btnJourneyPlay', button => button.textContent),
		'自动播放',
		'Space 应暂停人生轨迹',
	);
	await page.keyboard.press('ArrowRight');
	await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '西安');
	const segmentState = await page.evaluate(() => {
		const avatar = document.querySelector('.journey-avatar')?.getBoundingClientRect();
		const map = document.getElementById('map').getBoundingClientRect();
		const zoom = Math.max(
			...[...document.querySelectorAll('.leaflet-tile')]
				.map(tile => Number(tile.src.match(/\/(\d+)\/\d+\/\d+\.png/)?.[1]))
				.filter(Number.isFinite),
		);
		return {
			avatarVisible: avatar
				&& avatar.left >= map.left
				&& avatar.right <= map.right
				&& avatar.top >= map.top
				&& avatar.bottom <= map.bottom,
			zoom,
			timelineLabel: document.getElementById('journeyTimeCurrent')?.textContent,
			timelineProgress: parseFloat(document.getElementById('journeyTimeFill')?.style.width || '0'),
			markersStable: [...document.querySelectorAll('.leaflet-marker-icon')].every(marker =>
				marker.style.transform.includes('translate3d')
				&& !marker.style.transform.includes('scale')
				&& !marker.style.transition.includes('transform')
			),
		};
	});
	assert(segmentState.avatarVisible, '轨迹头像在分段移动后应保持在可见地图范围内');
	assert(segmentState.zoom > initialZoom, '展示短途分段时应放大地图');
	assert.equal(segmentState.timelineLabel, '2010 夏 · 西安', '时间轴应展示当前结构化日期和地点');
	assert(segmentState.timelineProgress > 0, '时间轴应随人生轨迹向前推进');
	assert(segmentState.markersStable, '地图放大后 Marker 必须继续由 Leaflet transform 定位');

	const timelineMarkers = await page.evaluate(() => ({
		phases: document.querySelectorAll('#journeyTimeTicks .is-phase').length,
		stays: document.querySelectorAll('#journeyTimeTicks .is-stay').length,
		visits: document.querySelectorAll('#journeyTimeTicks .is-visit').length,
	}));
	assert.deepEqual(
		timelineMarkers,
		expectedTimelineMarkers,
		'时间轴应以不同强度标记主基地、次级基地和普通行程',
	);
	assert(
		await page.$('#journeyTimeTicks button[aria-label*="2023 夏 · 嘉兴 · 与家人前往嘉兴旅行"]'),
		'时间轴应包含杭州实习期间的嘉兴旅行',
	);
	assert(
		await page.$('#journeyTimeTicks button[aria-label*="2020.7 — 2020.9 · 庆阳 · 高考后回家"]'),
		'时间轴应包含高考后持续到开学的庆阳驻留',
	);
	await page.click('#journeyTimeTicks button[aria-label*="2020.7 — 2020.9 · 庆阳 · 高考后回家"]');
	await page.click('#btnJourneyNext');
	await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '南京');

	await page.click('#journeyTimeTicks button[aria-label*="杭州"]');
	await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '杭州');
	assert.equal(
		await page.$eval('#btnJourneyPlay', button => button.textContent),
		'自动播放',
		'点击时间轴标记后应暂停，并允许从当前位置继续播放',
	);

	const trackBox = await page.$eval('#journeyTimeTrack', track => {
		const rect = track.getBoundingClientRect();
		return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
	});
	await page.mouse.move(trackBox.x + trackBox.width * 0.55, trackBox.y + trackBox.height / 2);
	await page.mouse.down();
	await page.mouse.move(trackBox.x + trackBox.width * 0.88, trackBox.y + trackBox.height / 2, { steps: 6 });
	await page.mouse.up();
	assert(
		parseFloat(await page.$eval('#journeyTimeFill', fill => fill.style.width)) > 80,
		'拖动时间轴应更新轨迹进度',
	);

	await page.focus('#journeyTimeTrack');
	await page.keyboard.press('Home');
	await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '庆阳');
	await page.keyboard.press('End');
	await page.waitForFunction(() =>
		document.getElementById('journeyCity')?.textContent === '北京'
		&& document.getElementById('journeyPeriod')?.textContent === '2026.6.27 — 至今');
	await new Promise(resolve => setTimeout(resolve, 350));

	await mkdir(join(process.cwd(), 'tmp'), { recursive: true });
	await page.screenshot({ path: join(process.cwd(), 'tmp', 'map-runtime.png'), fullPage: true });
	await page.evaluate(() => {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
	});
	await page.keyboard.press('Escape');
	assert(
		await page.$eval('#journeyTimeline', timeline => timeline.hidden),
		'Escape 应退出人生轨迹',
	);

	await Promise.all([
		page.waitForResponse(response => new URL(response.url()).pathname === '/geojson/china.json'),
		page.click('.map-ctrl-btn[data-mode="province"]'),
	]);
	assert.equal(
		geoRequests.filter(pathname => pathname === '/geojson/china.json').length,
		1,
		'省份数据只应在首次切换到省份视图时加载一次',
	);
	await page.waitForFunction(() => !document.querySelector('.map-ctrl-btn[data-view="world"]')?.disabled);

	await Promise.all([
		page.waitForResponse(response => new URL(response.url()).pathname === '/geojson/world.json'),
		page.click('.map-ctrl-btn[data-view="world"]'),
	]);
	assert.equal(
		geoRequests.filter(pathname => pathname === '/geojson/world.json').length,
		1,
		'世界数据只应在首次切换到世界视图时加载一次',
	);
	console.log(`Map runtime verification passed (${markerLayout.markers.length} markers, zoom ${initialZoom} → ${segmentState.zoom}).`);
} finally {
	await browser?.close();
	await server.close();
}
