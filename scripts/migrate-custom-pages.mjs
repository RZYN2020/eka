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
	.replace('color: "#5b8cc9", slug: "",', 'color: "#5b8cc9", slug: "qinhuai",')
	.replace('{ city:"扬州", province:"江苏", dates:"2025.5", year:2025, slug:"" }', '{ city:"扬州", province:"江苏", dates:"2025.5", year:2025, slug:"yangzhou" }')
	.replace('{ city:"九江", province:"江西", dates:"2026.6", year:2026, slug:"" }', '{ city:"九江", province:"江西", dates:"2026.6", year:2026, slug:"lushan" }')
	.replace(
		'// =============================================================================\n// State',
		`const blogTitles = {
    qinhuai: '秦淮',
    yangzhou: '扬州游记',
    lushan: '庐山游记'
};

// =============================================================================
// State`,
	)
	.replace(
		'style="display:inline-flex;align-items:center;gap:2px;font-size:0.72rem;color:#b0a590;text-decoration:none;margin-top:2px;" onclick="event.stopPropagation()">游记 ',
		'class="blink" onclick="event.stopPropagation()">${blogTitles[slug] ?? \'相关文章\'} ',
	)
	.replace(
		'title="游记">游记<svg',
		'title="相关文章">${blogTitles[slug] ?? \'相关文章\'}<svg',
	)
	.replaceAll('href="/journal/posts/${slug}/"', 'href="/writing/${slug}/"')
	.replace("window.location.href='/journal';", "window.location.href='/about/';");

mapScript = mapScript
	.replaceAll('#e88d2e', '#9a6a50')
	.replaceAll('#4d9e7b', '#62796e')
	.replaceAll('#5b8cc9', '#61758c')
	.replace('zoomControl: true, attributionControl: false', 'zoomControl: true, attributionControl: true')
	.replace(
		"const hexRGBA = (h,a) => `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;",
		`const hexRGBA = (h,a) => \`rgba(\${parseInt(h.slice(1,3),16)},\${parseInt(h.slice(3,5),16)},\${parseInt(h.slice(5,7),16)},\${a})\`;
const tone = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;`,
	)
	.replace(
		/function styleCity\(f\) \{[\s\S]*?\n\}\nfunction onCity/,
		`function styleCity(f) {
    const visited = isVisitedCity(f.properties.name);
    return {
        fillColor: visited ? tone('--map-visited-fill', '#68788a') : 'transparent',
        fillOpacity: visited ? 0.18 : 0,
        color: visited ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
        weight: visited ? 1.2 : 0.45,
        opacity: visited ? 0.9 : 0.55,
        className: visited ? 'pv' : '',
        interactive: visited
    };
}
function onCity`,
	)
	.replace(
		/function styleProvince\(f\) \{[\s\S]*?\n\}\nfunction onProvince/,
		`function styleProvince(f) {
    const n = f.properties.name;
    if (n==='十段线'||n==='南海诸岛') {
        return { fillColor:'transparent', fillOpacity:0, color:tone('--map-boundary', '#aaa7a0'), weight:0.4, dashArray:'3 5', interactive:false };
    }
    const visited = isVisitedProvince(n);
    return {
        fillColor: visited ? tone('--map-visited-fill', '#68788a') : 'transparent',
        fillOpacity: visited ? 0.16 : 0,
        color: visited ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
        weight: visited ? 1.2 : 0.5,
        opacity: visited ? 0.9 : 0.55,
        interactive: visited
    };
}
function onProvince`,
	)
	.replace(
		/function styleWorld\(f\) \{[\s\S]*?\n\}\nfunction onWorld/,
		`function styleWorld(f) {
    const visited = isVisitedCountry(f);
    return {
        fillColor: visited ? tone('--map-visited-fill', '#68788a') : 'transparent',
        fillOpacity: visited ? 0.16 : 0,
        color: visited ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
        weight: visited ? 1.1 : 0.4,
        opacity: visited ? 0.9 : 0.5,
        interactive: visited
    };
}
function onWorld`,
	)
	.replace(
		/function switchView\(view\) \{[\s\S]*?\n\}\n\nfunction updateLayerStyles/,
		`function switchView(view) {
    currentView = view;
    if (view === 'world') highlightMode = 'country';
    else if (highlightMode === 'country') highlightMode = 'city';
    document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => {
        const active = b.dataset.view === view;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach(b => {
        const active = b.dataset.mode === highlightMode;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('modeControls').hidden = view === 'world';
    map.flyTo(view === 'china' ? [34, 108] : [20, 0], view === 'china' ? 5 : 2, { duration: 0.7 });
    applyHighlightMode();
    updateLayerStyles();
}

function updateLayerStyles`,
	)
	.replace(
		"sideCol.classList.toggle('open');\n    btnMob.innerHTML",
		"sideCol.classList.toggle('open');\n    document.body.classList.toggle('map-sidebar-open', sideCol.classList.contains('open'));\n    btnMob.setAttribute('aria-expanded', String(sideCol.classList.contains('open')));\n    btnMob.innerHTML",
	)
	.replace(
		"b.classList.toggle('active', b.dataset.mode === mode);\n    });\n    applyHighlightMode();",
		"const active = b.dataset.mode === mode;\n        b.classList.toggle('active', active);\n        b.setAttribute('aria-pressed', String(active));\n    });\n    applyHighlightMode();",
	);

const personalizedMapBody = mapBody
	.replaceAll('旅行足迹', '人生足迹')
	.replace(
		'<div class="map-ctrls">\n                    <button class="map-ctrl-btn active" data-mode="city">',
		'<div class="map-ctrls" id="modeControls">\n                    <button class="map-ctrl-btn active" data-mode="city" aria-pressed="true">',
	)
	.replace('<button class="map-ctrl-btn" data-mode="province">', '<button class="map-ctrl-btn" data-mode="province" aria-pressed="false">')
	.replace('                    <button class="map-ctrl-btn" data-mode="country">国家</button>\n', '')
	.replace('<button class="map-ctrl-btn active" data-view="china">', '<button class="map-ctrl-btn active" data-view="china" aria-pressed="true">')
	.replace('<button class="map-ctrl-btn" data-view="world">', '<button class="map-ctrl-btn" data-view="world" aria-pressed="false">')
	.replace('id="btnMob" class="btn-mob" aria-label="列表"', 'id="btnMob" class="btn-mob" aria-label="列表" aria-expanded="false"');

await fs.mkdir(path.join(projectRoot, 'src/styles'), { recursive: true });
await fs.mkdir(path.join(projectRoot, 'src/scripts'), { recursive: true });
await fs.mkdir(path.join(projectRoot, 'src/pages/map'), { recursive: true });
await fs.writeFile(path.join(projectRoot, 'src/styles/map.css'), mapStyle);
await fs.writeFile(path.join(projectRoot, 'src/scripts/travel-map.js'), `import L from 'leaflet';\n${mapScript.trim()}\n`);
await fs.writeFile(
	path.join(projectRoot, 'src/pages/map/index.astro'),
	`---
import '../../styles/global.css';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';
import '../../styles/map-theme.css';
---
<!doctype html>
<html lang="zh-CN" data-theme="light">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width" />
	<meta name="theme-color" content="#ffffff" />
	<script is:inline>
		const savedTheme = localStorage.getItem('eka-theme');
		const theme = savedTheme === 'light' || savedTheme === 'dark'
			? savedTheme
			: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		document.documentElement.dataset.theme = theme;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111111' : '#ffffff');
	</script>
	<link rel="icon" type="image/webp" href="/favicon.webp" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap" />
	<title>人生足迹 · Eka</title>
</head>
<body>
${personalizedMapBody.trim()}
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
