import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
	site: 'https://yongzhen.space',
	output: 'static',
	trailingSlash: 'always',
	integrations: [sitemap()],
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
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
	vite: {
		plugins: [tailwindcss()],
	},
});
