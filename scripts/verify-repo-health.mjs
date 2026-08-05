import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const MiB = 1024 * 1024;
const failures = [];

async function walk(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files = await Promise.all(entries.map(async (entry) => {
		const target = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(target) : [target];
	}));
	return files.flat();
}

const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies?.d3) {
	failures.push('package.json 仍包含未使用的 d3 模块依赖；静态幻灯片应继续使用 public/vendor/d3.min.js。');
}
if (packageJson.scripts?.verify !== 'node scripts/verify.mjs') {
	failures.push('完整验证仍由 package.json 中的长命令串联，应交给 scripts/verify.mjs 统一调度。');
}

const contentAssets = (await walk(path.join(root, 'src/content/writing')))
	.filter((file) => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file));
for (const file of contentAssets) {
	const { size } = await fs.stat(file);
	if (size > 3 * MiB) {
		failures.push(`${path.relative(root, file)} 超过 3 MiB（${(size / MiB).toFixed(1)} MiB）。`);
	}
}

for (const [relativePath, limit] of [
	['public/geojson/world.json', 8 * MiB],
	['public/geojson/china-cities.json', 2 * MiB],
]) {
	const { size } = await fs.stat(path.join(root, relativePath));
	if (size > limit) {
		failures.push(`${relativePath} 超过 ${(limit / MiB).toFixed(0)} MiB 预算（${(size / MiB).toFixed(1)} MiB）。`);
	}
}

const duplicateCandidates = [
	...(await walk(path.join(root, 'src/content/writing'))).filter((file) => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file)),
	...(await walk(path.join(root, 'public/content-assets'))).filter((file) => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file)),
];
const assetsByDigest = new Map();
for (const file of duplicateCandidates) {
	const digest = createHash('sha256').update(await fs.readFile(file)).digest('hex');
	const matches = assetsByDigest.get(digest) ?? [];
	matches.push(path.relative(root, file));
	assetsByDigest.set(digest, matches);
}
for (const matches of assetsByDigest.values()) {
	if (matches.length > 1) failures.push(`重复资产：${matches.join('、')}`);
}

const travelMap = await fs.readFile(path.join(root, 'src/scripts/travel-map.js'), 'utf8');
const travelMapLines = travelMap.split('\n').length;
if (travelMapLines > 1050) failures.push(`src/scripts/travel-map.js 为 ${travelMapLines} 行，应继续拆分职责模块。`);
const legacyMapTheme = await fs.stat(path.join(root, 'src/styles/map-theme.css')).catch(() => null);
if (legacyMapTheme) failures.push('地图样式仍跨 map.css 与 map-theme.css 两个级联层维护。');

if (failures.length) {
	console.error(`Repository health violations:\n${failures.join('\n')}`);
	process.exit(1);
}

console.log('Repository asset budgets, dependency boundaries, and module-size contracts are current.');
