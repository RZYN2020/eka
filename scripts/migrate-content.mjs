import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';
import { parse as parseToml } from 'smol-toml';

const projectRoot = process.cwd();
const sourceRoot = path.resolve(projectRoot, '..');

const writingEntries = [
	{ path: 'RZYN2020.github.io/blogs/human/我们向何处去？.md', slug: 'where-are-we-going', kind: 'essay', featured: false },
	{ path: 'RZYN2020.github.io/blogs/human/吉登斯「社会学」笔记.md', slug: 'giddens-sociology', kind: 'essay', featured: true },
	{ path: 'RZYN2020.github.io/blogs/human/Agent社会模拟.md', slug: 'agent-social-simulation', kind: 'technical' },
	{ path: 'RZYN2020.github.io/blogs/life/数字直觉.md', slug: 'digital-intuition', kind: 'essay' },
	{ path: 'RZYN2020.github.io/blogs/tech/编译器开发反思.md', slug: 'compiler-reflections', kind: 'technical' },
	{ path: 'RZYN2020.github.io/blogs/tech/代理技术分享/index.md', slug: 'proxy-technology', kind: 'technical' },
	{ path: 'RZYN2020.github.io/blogs/tech/脑电波与信号处理/index.md', slug: 'brainwaves-and-signal-processing', kind: 'technical' },
	{ path: 'RZYN2020.github.io/blogs/tech/后台开发全景图：思考，方法，以及实践/index.md', slug: 'backend-panorama', kind: 'technical', featured: true },
	{ path: 'RZYN2020.github.io/blogs/tech/Adaptation in Action/index.md', slug: 'adaptation-in-action', kind: 'technical' },
	{ path: 'RZYN2020.github.io/blogs/tech/BitTorrent协议及其扩展/index.md', slug: 'bittorrent-protocol', kind: 'technical' },
	{ path: 'RZYN2020.github.io/blogs/tech/Building a Transformer LM/index.md', slug: 'building-a-transformer-lm', kind: 'technical', featured: true },
	{ path: 'RZYN2020.github.io/blogs/tech/Optimize the performance of a LM/index.md', slug: 'optimize-language-model-performance', kind: 'technical' },
	{ path: 'journal/content/posts/幻光.md', slug: 'phantom-light', kind: 'journal', featured: true },
	{ path: 'journal/content/posts/凯撒不做狗屁工作.md', slug: 'caesar-refuses-bullshit-work', kind: 'journal' },
	{ path: 'journal/content/posts/秦淮/index.md', slug: 'qinhuai', kind: 'journal' },
	{ path: 'journal/content/posts/扬州游记/index.md', slug: 'yangzhou', kind: 'journal' },
	{ path: 'journal/content/posts/庐山游记/index.md', slug: 'lushan', kind: 'journal' },
];

const blogNoteEntries = [
	{ path: 'RZYN2020.github.io/blogs/tech/树的非递归遍历—用栈模拟递归.md', slug: 'iterative-tree-traversal', topic: 'Algorithms' },
	{ path: 'RZYN2020.github.io/blogs/tech/编译器的结构与任务/index.md', slug: 'compiler-structure', topic: 'Programming Languages' },
	{ path: 'RZYN2020.github.io/blogs/tech/深度学习基础知识总结/index.md', slug: 'deep-learning-foundations', topic: 'AI' },
	{ path: 'RZYN2020.github.io/blogs/tech/浅谈java8中的流.md', slug: 'java-8-streams', topic: 'Backend' },
	{ path: 'RZYN2020.github.io/blogs/tech/浅析jump-buf的定义.md', slug: 'jmp-buf', topic: 'Systems' },
	{ path: 'RZYN2020.github.io/blogs/tech/Multiplication-part1/index.md', slug: 'multiplication', topic: 'Computer Science' },
	{ path: 'RZYN2020.github.io/blogs/tech/MySQL知识点总结/index.md', slug: 'mysql-notes', topic: 'Backend' },
	{ path: 'RZYN2020.github.io/blogs/tech/探究支撑os的硬件(以xv6和riscv为例)/index.md', slug: 'xv6-riscv-hardware', topic: 'Systems' },
	{ path: 'RZYN2020.github.io/blogs/tech/Scheme拾遗/index.md', slug: 'scheme-notes', topic: 'Programming Languages' },
	{ path: 'RZYN2020.github.io/blogs/tech/Autoboxing-and-IntegerCache-in-Java/index.md', slug: 'java-integer-cache', topic: 'Backend' },
];

const algorithmTitles = {
	'index': '算法笔记：前言',
	'gugu-interview': '咕咕：面试篇',
	'haskell-learning': 'Haskell 学习笔记',
	'leetcode-2024-feb': 'LeetCode · 2024 年 2 月',
	'leetcode-2024-jan': 'LeetCode · 2024 年 1 月',
	'leetcode-ali': '算法题 · 阿里',
	'leetcode-bytedance-2023': '算法题 · 字节跳动',
	'leetcode-contest-355': 'LeetCode 周赛 355',
	'leetcode-feb-2025': 'LeetCode · 2025 年 2 月',
	'leetcode-hot100-100': 'LeetCode Hot 100 · 完成',
	'leetcode-hot100-12': 'LeetCode Hot 100 · 12%',
	'leetcode-hot100-25': 'LeetCode Hot 100 · 25%',
	'leetcode-hot100-50': 'LeetCode Hot 100 · 50%',
	'leetcode-hot100-77': 'LeetCode Hot 100 · 77%',
	'leetcode-tencent': '算法题 · 腾讯',
	'leetcode-zunxiang-19': 'LeetCode 尊享 100 · 19%',
	'leetcode-zunxiang-36': 'LeetCode 尊享 100 · 36%',
};

function parseSource(raw) {
	if (raw.startsWith('+++')) {
		const end = raw.indexOf('\n+++', 3);
		const frontmatter = raw.slice(3, end).trim();
		return { data: parseToml(frontmatter), content: raw.slice(end + 4).trimStart() };
	}
	return matter(raw);
}

function cleanBody(content) {
	return content
		.replace(/<!--more-->/g, '')
		.replaceAll('https://rzyn2020.github.io/posts/', '/writing/')
		.replaceAll('https://RZYN2020.github.io/posts/', '/writing/')
		.replaceAll('/writing/optimize-the-performance-of-a-lm/', '/writing/optimize-language-model-performance/')
		.replaceAll('.png#half)', '.png)')
		.replaceAll('./assets/rl_algorithms_9_15.svg', '/content-assets/rl_algorithms_9_15.svg')
		.trimStart();
}

function stringArray(value) {
	if (!value) return [];
	const values = Array.isArray(value) ? value : [value];
	return values.filter(Boolean).map(String);
}

function legacyPath(sourcePath, slug, type) {
	if (sourcePath.startsWith('journal/')) return [`/journal/posts/${path.basename(path.dirname(sourcePath))}/`, `/journal/posts/${slug}/`];
	if (type === 'note') return [`/posts/${slug}/`];
	return [`/posts/${slug}/`];
}

async function copyBundleAssets(sourceFile, destinationDir) {
	const sourceDir = path.dirname(sourceFile);
	for (const assetDir of ['assets', 'img']) {
		const from = path.join(sourceDir, assetDir);
		try {
			await fs.access(from);
			await fs.cp(from, path.join(destinationDir, assetDir), { recursive: true, force: true });
		} catch {
			// Most posts are single Markdown files without local assets.
		}
	}
}

async function optimizeLargePngs(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await optimizeLargePngs(target);
			continue;
		}
		if (!entry.name.toLowerCase().endsWith('.png')) continue;
		const stats = await fs.stat(target);
		if (stats.size < 8 * 1024 * 1024) continue;
		const metadata = await sharp(target).metadata();
		if (Math.max(metadata.width ?? 0, metadata.height ?? 0) <= 2400) continue;
		const temporary = `${target}.optimized`;
		await sharp(target)
			.rotate()
			.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
			.png({ compressionLevel: 9 })
			.toFile(temporary);
		await fs.rename(temporary, target);
	}
}

async function writeWriting(entry) {
	const sourceFile = path.join(sourceRoot, entry.path);
	const raw = await fs.readFile(sourceFile, 'utf8');
	const parsed = parseSource(raw);
	const destinationDir = path.join(projectRoot, 'src/content/writing', entry.slug);
	await fs.mkdir(destinationDir, { recursive: true });
	const data = {
		title: String(parsed.data.title ?? entry.slug),
		description: String(parsed.data.description ?? ''),
		publishedAt: parsed.data.date,
		kind: entry.kind,
		tags: [...new Set([...stringArray(parsed.data.categories), ...stringArray(parsed.data.tags)])],
		draft: Boolean(parsed.data.draft),
		featured: Boolean(entry.featured),
		legacyUrls: legacyPath(entry.path, entry.slug, 'writing'),
	};
	await fs.writeFile(path.join(destinationDir, 'index.md'), matter.stringify(cleanBody(parsed.content), data));
	await copyBundleAssets(sourceFile, destinationDir);
}

async function writeBlogNote(entry) {
	const sourceFile = path.join(sourceRoot, entry.path);
	const raw = await fs.readFile(sourceFile, 'utf8');
	const parsed = parseSource(raw);
	const destinationDir = path.join(projectRoot, 'src/content/notes/knowledge', entry.slug);
	await fs.mkdir(destinationDir, { recursive: true });
	const data = {
		title: String(parsed.data.title ?? entry.slug),
		description: '',
		topic: entry.topic,
		tags: [...new Set([...stringArray(parsed.data.categories), ...stringArray(parsed.data.tags)])],
		publishedAt: parsed.data.date,
		order: 500,
		draft: Boolean(parsed.data.draft),
		source: 'blog',
		legacyUrls: legacyPath(entry.path, entry.slug, 'note'),
	};
	await fs.writeFile(path.join(destinationDir, 'index.md'), matter.stringify(cleanBody(parsed.content), data));
	await copyBundleAssets(sourceFile, destinationDir);
}

async function writeAlgorithmNotes() {
	const sourceDir = path.join(sourceRoot, 'algorithm/docs');
	const destinationDir = path.join(projectRoot, 'src/content/notes/algorithm');
	await fs.mkdir(destinationDir, { recursive: true });
	await fs.cp(path.join(sourceDir, 'assets'), path.join(destinationDir, 'assets'), { recursive: true, force: true });
	const files = (await fs.readdir(sourceDir)).filter((file) => file.endsWith('.md')).sort();
	for (const [index, file] of files.entries()) {
		const slug = path.basename(file, '.md');
		const raw = await fs.readFile(path.join(sourceDir, file), 'utf8');
		const parsed = matter(raw);
		const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
		const data = {
			title: algorithmTitles[slug] ?? heading ?? slug,
			description: String(parsed.data.description ?? ''),
			topic: slug === 'haskell-learning' ? 'Programming Languages' : 'Algorithms',
			tags: stringArray(parsed.data.tags),
			order: index,
			draft: false,
			source: 'algorithm',
			legacyUrls: [`/algorithm/${slug}/`],
		};
		let body = cleanBody(parsed.content);
		if (heading && body.startsWith(`# ${heading}`)) body = body.slice(heading.length + 2).trimStart();
		await fs.writeFile(path.join(destinationDir, file), matter.stringify(body, data));
	}
}

async function writeResume() {
	for (const lang of ['zh', 'en', 'ja']) {
		const raw = await fs.readFile(path.join(sourceRoot, `resume/resume_${lang}.md`), 'utf8');
		const title = lang === 'zh' ? '中文简历' : lang === 'en' ? 'Résumé' : '日本語履歴書';
		const body = raw.replace(/^#\s+.*\n+/, '');
		const destination = path.join(projectRoot, `src/content/resume/${lang}.md`);
		await fs.mkdir(path.dirname(destination), { recursive: true });
		await fs.writeFile(destination, matter.stringify(body, { title, lang }));
	}
	await fs.mkdir(path.join(projectRoot, 'public/resume'), { recursive: true });
	for (const lang of ['zh', 'en', 'ja']) {
		await fs.cp(
			path.join(sourceRoot, `resume/resume_${lang}.pdf`),
			path.join(projectRoot, `public/resume/resume_${lang}.pdf`),
			{ force: true },
		);
	}
	await fs.cp(path.join(sourceRoot, 'resume/photo.jpg'), path.join(projectRoot, 'public/resume/photo.jpg'), { force: true });
}

await Promise.all(writingEntries.map(writeWriting));
await Promise.all(blogNoteEntries.map(writeBlogNote));
await writeAlgorithmNotes();
await writeResume();
await fs.mkdir(path.join(projectRoot, 'public/content-assets'), { recursive: true });
await fs.cp(
	path.join(sourceRoot, 'RZYN2020.github.io/blogs/tech/Adaptation in Action/assets/rl_algorithms_9_15.svg'),
	path.join(projectRoot, 'public/content-assets/rl_algorithms_9_15.svg'),
	{ force: true },
);
await optimizeLargePngs(path.join(projectRoot, 'src/content'));

console.log(`Migrated ${writingEntries.length} writing entries, ${blogNoteEntries.length + Object.keys(algorithmTitles).length} notes, and 3 resumes.`);
