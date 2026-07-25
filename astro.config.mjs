import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkHugoShortcodes from './src/lib/remark-hugo-shortcodes.mjs';

export default defineConfig({
	site: 'https://yongzhen.space',
	output: 'static',
	trailingSlash: 'always',
	integrations: [sitemap()],
	markdown: {
		processor: unified({
			remarkPlugins: [remarkHugoShortcodes, remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark-default',
			},
			wrap: true,
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
