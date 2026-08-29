import assert from 'node:assert/strict';
import { join } from 'node:path';
import { launchBrowser } from './lib/browser.mjs';
import { startStaticServer } from './lib/static-server.mjs';

const server = await startStaticServer(join(process.cwd(), 'dist'));
let browser;

async function pageAt(pathname, viewport, reducedMotion = false) {
	const page = await browser.newPage();
	await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
	if (reducedMotion) {
		await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
	}
	await page.goto(`${server.origin}${pathname}`, { waitUntil: 'networkidle0' });
	return page;
}

try {
	browser = await launchBrowser();

	const about = await pageAt('/about/', { width: 1280, height: 800 });
	const aboutReader = await about.evaluate(() => {
		const copy = document.querySelector('.about-copy');
		const reader = document.querySelector('.window-reader');
		const elsewhere = document.querySelector('.about-panel > h2');
		const frames = [...document.querySelectorAll('.window-reader__frame')];
		const rect = (element) => {
			const bounds = element.getBoundingClientRect();
			return { width: bounds.width, height: bounds.height };
		};
		return {
			placement: reader?.dataset.readerPlacement,
			copyBeforeReader: Boolean(copy?.compareDocumentPosition(reader) & Node.DOCUMENT_POSITION_FOLLOWING),
			readerBeforeElsewhere: Boolean(
				reader?.compareDocumentPosition(elsewhere) & Node.DOCUMENT_POSITION_FOLLOWING,
			),
			container: rect(reader),
			frames: frames.map(rect),
			animations: document.getAnimations().map((animation) => animation.animationName),
		};
	});
	assert.equal(aboutReader.placement, 'inline', 'About 应使用文档流内的人物');
	assert(
		aboutReader.copyBeforeReader && aboutReader.readerBeforeElsewhere,
		'About 人物应位于正文和 Elsewhere 之间',
	);
	assert.equal(aboutReader.frames.length, 3, '人物翻书动画应包含三帧');
	for (const frame of aboutReader.frames) {
		assert.deepEqual(frame, aboutReader.container, '人物动画帧必须与稳定容器保持相同尺寸');
	}
	assert.deepEqual(
		new Set(aboutReader.animations),
		new Set(['reader-rest', 'reader-turn', 'reader-settle']),
		'人物帧动画契约已发生变化',
	);
	await about.close();

	const media = await pageAt('/media/', { width: 1280, height: 800 });
	assert.equal(
		await media.$eval('.window-reader', (reader) => reader.dataset.readerPlacement),
		'media',
		'Media 应使用固定人物',
	);
	const readerThemeFilters = await media.$eval('.window-reader__frame', (frame) => {
		document.documentElement.dataset.theme = 'light';
		const light = getComputedStyle(frame).filter;
		document.documentElement.dataset.theme = 'dark';
		const dark = getComputedStyle(frame).filter;
		return { light, dark };
	});
	assert(!readerThemeFilters.light.includes('invert(1)'), '浅色主题人物应使用黑色线条');
	assert(readerThemeFilters.dark.includes('invert(1)'), '深色主题人物应使用白色线条');
	await media.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
	assert.equal(
		await media.$eval('.window-reader', (reader) => getComputedStyle(reader).display),
		'none',
		'手机端 Media 不应显示人物',
	);
	await media.close();

	const snow = await pageAt('/writing/memories-of-snow/', { width: 1280, height: 800 });
	const snowState = await snow.evaluate(() => {
		const layer = document.querySelector('.snowfall');
		const prose = document.querySelector('.prose');
		const proseBounds = prose.getBoundingClientRect();
		const styles = getComputedStyle(layer);
		const clearHalf = Number.parseFloat(styles.getPropertyValue('--snow-clear-half')) * 16;
		return {
			count: layer.querySelectorAll('[data-flake]').length,
			display: styles.display,
			mask: styles.maskImage,
			proseInsideClearArea:
				proseBounds.left >= innerWidth / 2 - clearHalf && proseBounds.right <= innerWidth / 2 + clearHalf,
			animationCount: document.getAnimations().filter((animation) => animation.animationName === 'snow-fall')
				.length,
		};
	});
	assert.equal(snowState.count, 34, '雪花粒子数量应保持在桌面性能预算内');
	assert.equal(snowState.display, 'block', '桌面端应显示雪景');
	assert(
		snowState.mask.includes('transparent') || snowState.mask.includes('rgba(0, 0, 0, 0)'),
		'雪层必须包含正文透明安全区',
	);
	assert(snowState.proseInsideClearArea, '正文必须完整位于雪层透明安全区内');
	assert.equal(snowState.animationCount, 34, '每个雪花粒子应只有一个动画');
	await snow.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
	assert.deepEqual(
		await snow.$eval('.snowfall', (layer) => ({
			display: getComputedStyle(layer).display,
			animations: document.getAnimations().filter((animation) => animation.animationName === 'snow-fall')
				.length,
		})),
		{ display: 'none', animations: 0 },
		'手机端必须完全关闭雪景',
	);
	await snow.close();

	const ordinaryArticle = await pageAt('/writing/where-are-we-going/', { width: 1280, height: 800 });
	assert.equal(
		await ordinaryArticle.$$eval('[data-article-effect]', (effects) => effects.length),
		0,
		'普通文章不得加载文章视觉特效',
	);
	await ordinaryArticle.close();

	const lushan = await pageAt('/writing/lushan/', { width: 1280, height: 800 });
	const lushanState = await lushan.evaluate(() => {
		const effect = document.querySelector('[data-article-effect="lushan"]');
		const boundary = document.querySelector('.article-visual-boundary');
		const image = effect?.querySelector('img');
		return {
			insideBoundary: boundary?.contains(effect),
			asset: image?.getAttribute('src'),
		};
	});
	assert(lushanState.insideBoundary, '庐山背景必须由文章视觉边界约束');
	assert.equal(lushanState.asset, '/images/lushan-wulaofeng-silhouette.webp', '庐山背景应使用优化后的 WebP');
	await lushan.close();

	const reduced = await pageAt('/media/', { width: 1280, height: 800 }, true);
	assert.equal(
		await reduced.evaluate(
			() =>
				document.getAnimations().filter((animation) => animation.animationName.startsWith('reader-')).length,
		),
		0,
		'减少动态效果时人物必须保持静止',
	);
	await reduced.close();

	const responsiveCases = [
		{
			pathname: '/about/',
			selector: '.window-reader',
			expectedDisplay: () => 'block',
		},
		{
			pathname: '/media/',
			selector: '.window-reader',
			expectedDisplay: (width) => (width < 980 ? 'none' : 'block'),
		},
		{
			pathname: '/writing/memories-of-snow/',
			selector: '.snowfall',
			expectedDisplay: (width) => (width <= 720 ? 'none' : 'block'),
		},
		{
			pathname: '/writing/lushan/',
			selector: '.lushan-backdrop',
			expectedDisplay: (width) => (width < 980 ? 'none' : 'block'),
		},
	];
	const responsiveWidths = [320, 390, 768, 980, 1280, 1440];
	for (const { pathname, selector, expectedDisplay } of responsiveCases) {
		const page = await pageAt(pathname, { width: responsiveWidths[0], height: 844 });
		for (const width of responsiveWidths) {
			await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
			const state = await page.evaluate((effectSelector) => {
				const effect = document.querySelector(effectSelector);
				return {
					display: getComputedStyle(effect).display,
					viewportWidth: document.documentElement.clientWidth,
					scrollWidth: document.documentElement.scrollWidth,
				};
			}, selector);
			assert(state.scrollWidth <= state.viewportWidth, `${pathname} 在 ${width}px 下不应产生横向溢出`);
			assert.equal(
				state.display,
				expectedDisplay(width),
				`${pathname} 在 ${width}px 下的装饰可见性不符合响应式契约`,
			);
		}
		await page.close();
	}

	console.log(
		'Visual effect verification passed for placement, themes, viewport matrix, motion preferences, and article scoping.',
	);
} finally {
	await browser?.close();
	await server.close();
}
