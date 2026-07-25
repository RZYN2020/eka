import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceRoot = path.resolve(projectRoot, '..');

const mapSource = await fs.readFile(path.join(sourceRoot, 'journal/static/map.html'), 'utf8');
const mapStyle = mapSource.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const mapBody = mapSource.match(/<body>([\s\S]*?)<script src="https:\/\/unpkg\.com\/leaflet/)?.[1];
const inlineScripts = [...mapSource.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
let mapScript = inlineScripts.at(-1)?.[1];

if (!mapStyle || !mapBody || !mapScript) {
	throw new Error('Unable to extract the travel map page.');
}

mapScript = mapScript
	.replace("const GEO_CITY = '/journal/geojson/china-cities.json';", "const GEO_CITY = '/geojson/china-cities.json';")
	.replace("const GEO_PROVINCE = '/journal/geojson/china.json';", "const GEO_PROVINCE = '/geojson/china.json';")
	.replace("const GEO_WORLD = '/journal/geojson/world.json';", "const GEO_WORLD = '/geojson/world.json';")
	.replaceAll('href="/journal/posts/${slug}/"', 'href="/writing/${slug}/"')
	.replace("window.location.href='/journal';", "window.location.href='/writing/';");

await fs.mkdir(path.join(projectRoot, 'src/styles'), { recursive: true });
await fs.mkdir(path.join(projectRoot, 'src/scripts'), { recursive: true });
await fs.mkdir(path.join(projectRoot, 'src/pages/map'), { recursive: true });
await fs.writeFile(path.join(projectRoot, 'src/styles/map.css'), mapStyle);
await fs.writeFile(path.join(projectRoot, 'src/scripts/travel-map.js'), `import L from 'leaflet';\n${mapScript}\n`);
await fs.writeFile(
	path.join(projectRoot, 'src/pages/map/index.astro'),
	`---
import '../../styles/global.css';
import '../../styles/map.css';
import 'leaflet/dist/leaflet.css';
---
<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" type="image/webp" href="/favicon.webp" />
	<title>旅行足迹 · Eka</title>
</head>
<body>
${mapBody.trim()}
<script src="../../scripts/travel-map.js"></script>
</body>
</html>
`,
);

await fs.mkdir(path.join(projectRoot, 'public/geojson'), { recursive: true });
await fs.cp(path.join(sourceRoot, 'journal/static/geojson'), path.join(projectRoot, 'public/geojson'), {
	recursive: true,
	force: true,
});

await fs.mkdir(path.join(projectRoot, 'public/slides'), { recursive: true });
await fs.cp(path.join(sourceRoot, 'RZYN2020.github.io/static/slides'), path.join(projectRoot, 'public/slides'), {
	recursive: true,
	force: true,
});

const d3PagePath = path.join(projectRoot, 'public/slides/number_intuition/index.html');
const d3Page = await fs.readFile(d3PagePath, 'utf8');
await fs.writeFile(
	d3PagePath,
	d3Page.replace('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js', '/vendor/d3.min.js'),
);
await fs.mkdir(path.join(projectRoot, 'public/vendor'), { recursive: true });
await fs.cp(
	path.join(projectRoot, 'node_modules/d3/dist/d3.min.js'),
	path.join(projectRoot, 'public/vendor/d3.min.js'),
	{ force: true },
);

await fs.cp(
	path.join(sourceRoot, 'RZYN2020.github.io/static/img/yinyang.webp'),
	path.join(projectRoot, 'public/favicon.webp'),
	{ force: true },
);

console.log('Migrated travel map, GeoJSON data, legacy slide pages, and favicon.');
