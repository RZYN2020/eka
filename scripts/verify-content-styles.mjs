import fs from 'node:fs/promises';
import path from 'node:path';

const contentStyles = await fs.readFile(path.resolve('src/styles/content.css'), 'utf8');

const checks = [
	{
		name: 'unordered article lists use visible disc markers',
		pattern: /\.prose-eka\s+ul\s*\{[^}]*list-style(?:-type)?:\s*disc\b/s,
	},
	{
		name: 'ordered article lists use visible decimal markers',
		pattern: /\.prose-eka\s+ol\s*\{[^}]*list-style(?:-type)?:\s*decimal\b/s,
	},
	{
		name: 'dark-mode article images have a light backing surface',
		pattern:
			/:root\[data-theme=['"]dark['"]\]\s+\.prose-eka\s+img[^{]*\{[^}]*background(?:-color)?:\s*#fff(?:fff)?\b/s,
	},
];

const failures = checks.filter(({ pattern }) => !pattern.test(contentStyles));

if (failures.length) {
	console.error(`Content style checks failed:\n${failures.map(({ name }) => `- ${name}`).join('\n')}`);
	process.exit(1);
}

console.log(`Verified ${checks.length} article readability style invariants.`);
