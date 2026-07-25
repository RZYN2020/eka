import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');

async function walk(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	return (
		await Promise.all(
			entries.map((entry) => {
				const target = path.join(directory, entry.name);
				return entry.isDirectory() ? walk(target) : target;
			}),
		)
	).flat();
}

async function exists(file) {
	try {
		await fs.access(file);
		return true;
	} catch {
		return false;
	}
}

function candidates(pathname) {
	const clean = decodeURI(pathname);
	const relative = clean.replace(/^\/+|\/+$/g, '');
	if (!relative) return [path.join(dist, 'index.html')];
	if (path.extname(relative)) return [path.join(dist, relative)];
	return [
		path.join(dist, relative),
		path.join(dist, relative, 'index.html'),
		path.join(dist, `${relative}.html`),
	];
}

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const broken = [];
const missingAlt = [];

for (const file of htmlFiles) {
	const html = await fs.readFile(file, 'utf8');
	for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
		const value = match[1];
		if (!value || value.includes('${') || value.startsWith('#') || /^(?:mailto:|tel:|data:|javascript:)/.test(value)) continue;
		const pagePath = `/${path.relative(dist, file).replace(/index\.html$/, '')}`;
		const url = new URL(value, new URL(pagePath, 'https://yongzhen.space'));
		if (url.origin !== 'https://yongzhen.space') continue;
		const targets = candidates(url.pathname);
		if (!(await Promise.all(targets.map(exists))).some(Boolean)) {
			broken.push(`${path.relative(dist, file)} → ${url.pathname}`);
		}
	}
	for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
		if (!/\balt=["'][^"']*["']/.test(match[1])) {
			missingAlt.push(path.relative(dist, file));
		}
	}
}

if (broken.length || missingAlt.length) {
	if (broken.length) console.error(`Broken internal references:\n${[...new Set(broken)].join('\n')}`);
	if (missingAlt.length) console.error(`Images missing alt text:\n${[...new Set(missingAlt)].join('\n')}`);
	process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML pages: internal references resolve and images include alt text.`);
