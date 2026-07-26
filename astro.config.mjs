import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { site } from './src/config/site.ts';

function remarkArticleImageSizes() {
	return (tree) => {
		function visit(node) {
			if (node.type === 'image') {
				node.data ??= {};
				node.data.hProperties = {
					...node.data.hProperties,
					sizes: '(min-width: 752px) 720px, calc(100vw - 32px)',
				};
			}
			node.children?.forEach(visit);
		}

		visit(tree);
	};
}

export default defineConfig({
	site: site.url,
	output: 'static',
	trailingSlash: 'always',
	integrations: [sitemap()],
	image: {
		layout: 'constrained',
		responsiveStyles: true,
		breakpoints: [480, 720, 960, 1440],
	},
	markdown: {
		processor: unified({
			remarkPlugins: [remarkArticleImageSizes, remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark-default',
			},
			langAlias: {
				py: 'python',
				Python: 'python',
				Java: 'java',
				Assembly: 'asm',
			},
			wrap: true,
		},
	},
});
