import { spawn } from 'node:child_process';

const maintainedPaths = [
	'.github',
	'package.json',
	'eslint.config.js',
	'AGENTS.md',
	'README.md',
	'docs/*.md',
	'scripts/format.mjs',
	'scripts/verify.mjs',
	'scripts/verify-content-model.mjs',
	'scripts/verify-content-styles.mjs',
	'scripts/verify-map-runtime.mjs',
	'scripts/verify-project-contracts.mjs',
	'scripts/verify-repo-health.mjs',
	'scripts/verify-visual-effects.mjs',
	'src/content.config.ts',
	'src/components/effects',
	'src/features/travel-map',
	'src/layouts/ArticleLayout.astro',
	'src/layouts/BaseLayout.astro',
	'src/pages/about.astro',
	'src/scripts/travel-map.ts',
	'src/styles/content.css',
	'src/styles/map.css',
];

const write = process.argv.includes('--write');
const prettierMode = write ? '--write' : '--check';
const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(command, ['exec', 'prettier', prettierMode, ...maintainedPaths, '--ignore-unknown'], {
	stdio: 'inherit',
});

child.once('error', (error) => {
	console.error(error);
	process.exit(1);
});
child.once('exit', (code) => process.exit(code ?? 1));
