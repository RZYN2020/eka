import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { categories } from '../src/config/taxonomy.ts';

const contentRoot = path.resolve('src/content/writing');
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

async function walk(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	return (
		await Promise.all(entries.map((entry) => {
			const target = path.join(directory, entry.name);
			return entry.isDirectory() ? walk(target) : target;
		}))
	).flat();
}

function writingSlug(file) {
	return path.relative(contentRoot, file)
		.replace(/\.(?:md|mdx)$/, '')
		.replace(/[/\\]index$/, '')
		.replace(/^algorithm[/\\]/, '')
		.replaceAll(path.sep, '/');
}

const categoryMap = new Map(
	categories.map((category) => [category.name, new Set(category.subcategories)]),
);
const files = await walk(contentRoot);
const markdownFiles = files.filter((file) => /\.(?:md|mdx)$/.test(file));
const imageFiles = files.filter((file) => (
	imageExtensions.has(path.extname(file).toLowerCase())
	|| file.toLowerCase().endsWith('.svg+xml')
));
const failures = [];
const slugs = new Map();
const legacyUrls = new Map();
const sources = new Map();

for (const file of markdownFiles) {
	const raw = await fs.readFile(file, 'utf8');
	const parsed = matter(raw);
	const relative = path.relative(contentRoot, file);
	sources.set(file, raw);

	const slug = writingSlug(file);
	if (slugs.has(slug)) failures.push(`Duplicate output slug "${slug}": ${slugs.get(slug)} and ${relative}`);
	slugs.set(slug, relative);

	const allowedSubcategories = categoryMap.get(parsed.data.category);
	if (!allowedSubcategories) {
		failures.push(`${relative}: unknown category "${parsed.data.category}"`);
	} else {
		for (const subcategory of parsed.data.subcategories ?? []) {
			if (!allowedSubcategories.has(subcategory)) {
				failures.push(`${relative}: "${subcategory}" is not a child of "${parsed.data.category}"`);
			}
		}
	}

	if ('featured' in parsed.data) failures.push(`${relative}: obsolete "featured" field`);

	const publishedAt = parsed.data.publishedAt && new Date(parsed.data.publishedAt);
	const updatedAt = parsed.data.updatedAt && new Date(parsed.data.updatedAt);
	if (publishedAt && updatedAt && updatedAt < publishedAt) {
		failures.push(`${relative}: updatedAt is earlier than publishedAt`);
	}

	for (const legacyUrl of parsed.data.legacyUrls ?? []) {
		if (typeof legacyUrl !== 'string' || !legacyUrl.startsWith('/')) {
			failures.push(`${relative}: invalid legacy URL "${legacyUrl}"`);
			continue;
		}
		const normalized = `${legacyUrl.replace(/\/+$/, '')}/`;
		if (normalized.includes('/posts/posts/')) {
			failures.push(`${relative}: malformed legacy URL "${legacyUrl}"`);
		}
		if (legacyUrls.has(normalized) && legacyUrls.get(normalized) !== relative) {
			failures.push(`Duplicate legacy URL "${normalized}": ${legacyUrls.get(normalized)} and ${relative}`);
		}
		legacyUrls.set(normalized, relative);
	}
}

for (const file of imageFiles) {
	const basename = path.basename(file);
	if (![...sources.values()].some((raw) => raw.includes(basename) || raw.includes(encodeURI(basename)))) {
		failures.push(`${path.relative(contentRoot, file)}: unreferenced article asset`);
	}
}

if (failures.length) {
	console.error(`Content model violations:\n${failures.join('\n')}`);
	process.exit(1);
}

console.log(`Verified ${markdownFiles.length} writing entries and ${imageFiles.length} referenced article images.`);
