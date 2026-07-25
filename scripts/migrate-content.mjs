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

const blogArticleEntries = [
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

const algorithmEntries = [
	{
		slug: 'leetcode-contest-355',
		title: 'LeetCode 周赛 355',
		sources: ['leetcode-contest-355.md'],
		publishedAt: '2023-08-23T00:00:00+08:00',
		updatedAt: '2023-10-05T00:00:00+08:00',
	},
	{
		slug: 'haskell-learning',
		title: 'Haskell 学习笔记',
		sources: ['haskell-learning.md'],
		category: 'Tech',
		subcategories: ['Application'],
		publishedAt: '2023-10-05T00:00:00+08:00',
		updatedAt: '2024-01-15T00:00:00+08:00',
	},
	{
		slug: 'leetcode-daily-2024',
		title: 'LeetCode 日题 · 2024 年 1—2 月',
		sources: ['leetcode-2024-jan.md', 'leetcode-2024-feb.md'],
		publishedAt: '2024-01-14T00:00:00+08:00',
		updatedAt: '2024-02-17T00:00:00+08:00',
	},
	{
		slug: 'leetcode-hot100-12',
		title: 'LeetCode Hot 100 · 哈希、双指针与滑动窗口',
		sources: ['leetcode-hot100-12.md'],
		publishedAt: '2024-11-22T00:00:00+08:00',
		updatedAt: '2025-07-01T00:00:00+08:00',
	},
	{
		slug: 'leetcode-hot100-25',
		title: 'LeetCode Hot 100 · 动态规划',
		sources: ['leetcode-hot100-25.md'],
		publishedAt: '2024-12-01T00:00:00+08:00',
		updatedAt: '2025-07-01T00:00:00+08:00',
	},
	{
		slug: 'leetcode-bytedance-2023',
		title: '字节跳动算法题记录 · 2023 年 5—7 月',
		sources: ['leetcode-bytedance-2023.md'],
		publishedAt: '2023-05-01T00:00:00+08:00',
		updatedAt: '2023-07-31T00:00:00+08:00',
		transform: 'shift-headings',
	},
	{
		slug: 'leetcode-hot100-50',
		title: 'LeetCode Hot 100 · 二分、栈、堆与贪心',
		sources: ['leetcode-hot100-50.md'],
		publishedAt: '2025-02-09T00:00:00+08:00',
	},
	{
		slug: 'leetcode-hot100-77',
		title: 'LeetCode Hot 100 · 树、图与回溯',
		sources: ['leetcode-hot100-77.md'],
		publishedAt: '2025-02-11T00:00:00+08:00',
	},
	{
		slug: 'leetcode-hot100-100',
		title: 'LeetCode Hot 100 · 数组、矩阵与链表',
		sources: ['leetcode-hot100-100.md'],
		publishedAt: '2025-02-14T00:00:00+08:00',
	},
	{
		slug: 'leetcode-tencent',
		title: '腾讯算法题记录',
		sources: ['leetcode-tencent.md'],
		publishedAt: '2025-07-01T00:00:00+08:00',
		transform: 'trim-tencent-index',
	},
	{
		slug: 'gugu-interview',
		title: '算法面试准备',
		sources: ['gugu-interview.md'],
		publishedAt: '2025-07-01T00:00:00+08:00',
		updatedAt: '2025-07-29T00:00:00+08:00',
		transform: 'trim-google-overview',
	},
	{
		slug: 'leetcode-premium',
		title: 'LeetCode 尊享 100',
		sources: ['leetcode-zunxiang-19.md', 'leetcode-zunxiang-36.md'],
		publishedAt: '2025-07-29T00:00:00+08:00',
		updatedAt: '2025-07-30T00:00:00+08:00',
	},
];

function parseSource(raw) {
	if (raw.startsWith('+++')) {
		const end = raw.indexOf('\n+++', 3);
		const frontmatter = raw.slice(3, end).trim();
		return { data: parseToml(frontmatter), content: raw.slice(end + 4).trimStart() };
	}
	return matter(raw);
}

function cleanBody(content) {
	const containsLegacyBlock =
		/\{\{[%<]\s*comment\s*[%>]\}\}[\s\S]*?\{\{[%<]\s*\/comment\s*[%>]\}\}/i.test(content) ||
		/\{\{[%<]\s*\/?rawhtml\s*[%>]\}\}/i.test(content);
	const cleaned = content
		.replace(/<!--more-->/g, '')
		.replace(/\{\{[%<]\s*comment\s*[%>]\}\}[\s\S]*?\{\{[%<]\s*\/comment\s*[%>]\}\}/gi, '')
		.replace(/\{\{[%<]\s*\/?rawhtml\s*[%>]\}\}/gi, '')
		.replaceAll('https://rzyn2020.github.io/posts/', '/writing/')
		.replaceAll('https://RZYN2020.github.io/posts/', '/writing/')
		.replaceAll('/writing/optimize-the-performance-of-a-lm/', '/writing/optimize-language-model-performance/')
		.replace(/\/slides\/number_intuition\/?(?=[)"])/g, '/slides/number_intuition/index.html')
		.replace(/\/slides\/proxy\/?(?=[)"])/g, '/slides/proxy/index.html')
		.replaceAll('.png#half)', '.png)')
		.replaceAll('./assets/rl_algorithms_9_15.svg', '/content-assets/rl_algorithms_9_15.svg')
		.trimStart();
	return containsLegacyBlock ? cleaned.trimEnd() : cleaned;
}

function stringArray(value) {
	if (!value) return [];
	const values = Array.isArray(value) ? value : [value];
	return values.filter(Boolean).map(String);
}

const categoryParents = {
	AI: 'Tech',
	System: 'Tech',
	Backend: 'Tech',
	Application: 'Tech',
	Algorithm: 'Tech',
	Instinct: 'Life',
	Journal: 'Life',
	Sociology: 'Human',
	Economics: 'Human',
};

function taxonomy(data, fallbackCategory, fallbackSubcategory) {
	const subcategories = stringArray(data.categories);
	if (fallbackSubcategory && !subcategories.includes(fallbackSubcategory)) subcategories.push(fallbackSubcategory);
	const category = subcategories.map((value) => categoryParents[value]).find(Boolean) ?? fallbackCategory;
	return { category, subcategories };
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
	const fallbackCategory = entry.path.startsWith('journal/')
		? 'Life'
		: entry.path.includes('/human/')
			? 'Human'
			: entry.path.includes('/life/')
				? 'Life'
				: 'Tech';
	const classification = taxonomy(parsed.data, fallbackCategory, entry.kind === 'journal' ? 'Journal' : undefined);
	const data = {
		title: String(parsed.data.title ?? entry.slug),
		description: String(parsed.data.description ?? ''),
		publishedAt: parsed.data.date,
		...classification,
		tags: [...new Set(stringArray(parsed.data.tags))],
		draft: Boolean(parsed.data.draft),
		featured: Boolean(entry.featured),
		legacyUrls: legacyPath(entry.path, entry.slug, 'writing'),
	};
	await fs.writeFile(path.join(destinationDir, 'index.md'), matter.stringify(cleanBody(parsed.content), data));
	await copyBundleAssets(sourceFile, destinationDir);
}

async function writeBlogArticle(entry) {
	const sourceFile = path.join(sourceRoot, entry.path);
	const raw = await fs.readFile(sourceFile, 'utf8');
	const parsed = parseSource(raw);
	const destinationDir = path.join(projectRoot, 'src/content/writing', entry.slug);
	await fs.mkdir(destinationDir, { recursive: true });
	const data = {
		title: String(parsed.data.title ?? entry.slug),
		description: '',
		...taxonomy(parsed.data, 'Tech'),
		tags: [...new Set(stringArray(parsed.data.tags))],
		publishedAt: parsed.data.date,
		order: 500,
		draft: Boolean(parsed.data.draft),
		legacyUrls: [...legacyPath(entry.path, entry.slug, 'note'), `/notes/knowledge/${entry.slug}/`],
	};
	await fs.writeFile(path.join(destinationDir, 'index.md'), matter.stringify(cleanBody(parsed.content), data));
	await copyBundleAssets(sourceFile, destinationDir);
}

async function writeAlgorithmArticles() {
	const sourceDir = path.join(sourceRoot, 'algorithm/docs');
	const destinationDir = path.join(projectRoot, 'src/content/writing/algorithm');
	await fs.rm(destinationDir, { recursive: true, force: true });
	await fs.mkdir(destinationDir, { recursive: true });
	await fs.cp(path.join(sourceDir, 'assets'), path.join(destinationDir, 'assets'), { recursive: true, force: true });

	for (const [index, entry] of algorithmEntries.entries()) {
		const sourceBodies = await Promise.all(
			entry.sources.map(async (file) => {
				const raw = await fs.readFile(path.join(sourceDir, file), 'utf8');
				return cleanBody(matter(raw).content).trim();
			}),
		);
		let body = sourceBodies.filter(Boolean).join('\n\n---\n\n');
		if (entry.transform === 'trim-google-overview') {
			body = body.replace(/\n## 面试[\s\S]*$/, '').trim();
		}
		if (entry.transform === 'trim-tencent-index') {
			const firstNote = body.indexOf('### [546. 移除盒子]');
			if (firstNote >= 0) body = body.slice(firstNote);
			body = body.replace(/^### /gm, '## ');
		}
		if (entry.transform === 'shift-headings') {
			body = body.replace(/^(#{1,5}) /gm, '#$1 ');
		}
		body = body.replace(/^```py$/gm, '```python');
		body = body.replace(/[ \t]+$/gm, '');

		const sourceSlugs = entry.sources.map((file) => path.basename(file, '.md'));
		const data = {
			title: entry.title,
			description: '',
			category: entry.category ?? 'Tech',
			subcategories: entry.subcategories ?? ['Algorithm'],
			tags: [],
			publishedAt: entry.publishedAt,
			...(entry.updatedAt ? { updatedAt: entry.updatedAt } : {}),
			order: index,
			draft: false,
			legacyUrls: sourceSlugs.flatMap((slug) => [
				`/algorithm/${slug}/`,
				`/notes/algorithm/${slug}/`,
			]),
		};
		await fs.writeFile(path.join(destinationDir, `${entry.slug}.md`), matter.stringify(body, data));
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
await Promise.all(blogArticleEntries.map(writeBlogArticle));
await writeAlgorithmArticles();
await writeResume();
await fs.mkdir(path.join(projectRoot, 'public/content-assets'), { recursive: true });
await fs.cp(
	path.join(sourceRoot, 'RZYN2020.github.io/blogs/tech/Adaptation in Action/assets/rl_algorithms_9_15.svg'),
	path.join(projectRoot, 'public/content-assets/rl_algorithms_9_15.svg'),
	{ force: true },
);
await optimizeLargePngs(path.join(projectRoot, 'src/content'));

console.log(`Migrated ${writingEntries.length + blogArticleEntries.length + algorithmEntries.length} articles and 3 resumes.`);
