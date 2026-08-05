import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const read = (file) => fs.readFile(path.join(root, file), 'utf8');
const packageJson = JSON.parse(await read('package.json'));
const [
	readme,
	astroConfig,
	globalCss,
	contentCss,
	mapThemeCss,
	baseLayout,
	mapPage,
	searchPage,
	articleImages,
	contentModelVerifier,
] = await Promise.all([
	read('README.md'),
	read('astro.config.mjs'),
	read('src/styles/global.css'),
	read('src/styles/content.css'),
	read('src/styles/map-theme.css'),
	read('src/layouts/BaseLayout.astro'),
	read('src/pages/map/index.astro'),
	read('src/pages/search.astro'),
	read('src/components/ArticleImages.astro'),
	read('scripts/verify-content-model.mjs'),
]);

const failures = [];
const requireContract = (condition, message) => {
	if (!condition) failures.push(message);
};

requireContract(!packageJson.scripts.migrate, 'Retired migration command is still exposed.');
requireContract(!readme.includes('pnpm migrate'), 'README still instructs developers to run the destructive migration.');
requireContract(!(await fs.stat(path.join(root, 'scripts/migrate-content.mjs')).catch(() => null)), 'Legacy content migration script still exists.');
requireContract(!(await fs.stat(path.join(root, 'scripts/migrate-custom-pages.mjs')).catch(() => null)), 'Legacy page migration script still exists.');
requireContract(await fs.stat(path.join(root, '.github/workflows/ci.yml')).catch(() => null), 'CI workflow is missing.');
requireContract(!('@tailwindcss/vite' in packageJson.dependencies), 'Tailwind Vite plugin remains despite only four utility-class uses.');
requireContract(!('tailwindcss' in packageJson.dependencies), 'Tailwind remains despite only four utility-class uses.');
requireContract(!astroConfig.includes('tailwind'), 'Astro config still loads Tailwind.');
requireContract(!globalCss.includes('tailwindcss'), 'Global CSS still imports Tailwind.');
requireContract(!baseLayout.includes('fonts.googleapis.com'), 'Base layout still depends on Google Fonts.');
requireContract(!mapPage.includes('fonts.googleapis.com'), 'Map still depends on Google Fonts.');
requireContract(baseLayout.includes('ThemeBootstrap'), 'Base layout does not use the shared theme bootstrap.');
requireContract(mapPage.includes('ThemeBootstrap'), 'Map does not use the shared theme bootstrap.');
requireContract(!mapPage.includes('class="flex '), 'Map layout still relies on Tailwind utility classes.');
requireContract(!searchPage.includes('innerHTML'), 'Search results still render untrusted data with innerHTML.');
requireContract(!searchPage.includes('item: any'), 'Search documents are not typed.');
requireContract(articleImages.includes("'pointercancel'"), 'Image gallery drag state is not cleared on pointer cancellation.');
requireContract(articleImages.includes("'lostpointercapture'"), 'Image gallery drag state is not cleared after lost pointer capture.');
requireContract(
	articleImages.includes('image.draggable = false'),
	'Image gallery pictures still allow native browser dragging, which interrupts horizontal pointer scrolling.',
);
requireContract(
	/\.prose-eka\s+a\s*\{[^}]*overflow-wrap:\s*anywhere/s.test(contentCss),
	'Article links do not wrap long URLs on narrow screens.',
);
requireContract(
	/\.prose-eka\s+\.katex-display\s*\{[^}]*overflow-x:\s*auto/s.test(contentCss),
	'Display equations are not contained by a horizontal scroller on narrow screens.',
);
requireContract(
	/@media\s*\(max-width:\s*767px\)[^{]*\{[\s\S]*?\.sidebar-col\.open\s*\{[^}]*max-width:\s*100vw/s.test(mapThemeCss),
	'The open mobile map sidebar can exceed the viewport below 360px.',
);
requireContract(
	!/\bfrom\s+['"][^'"]+\.ts['"]/.test(contentModelVerifier),
	'Content verification imports TypeScript directly and is incompatible with the minimum Node version.',
);

if (failures.length) {
	console.error(`Project contract violations:\n${failures.join('\n')}`);
	process.exit(1);
}

console.log('Project structure, dependency, theme, search, and interaction contracts are current.');
