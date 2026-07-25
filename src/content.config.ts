import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
	schema: z.object({
		title: z.string(),
		description: z.string().default(''),
		publishedAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		category: z.string(),
		subcategories: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
		order: z.number().default(999),
		draft: z.boolean().default(false),
		featured: z.boolean().default(false),
		toc: z.boolean().default(true),
		legacyUrls: z.array(z.string()).default([]),
	}),
});

const resume = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/resume' }),
	schema: z.object({
		title: z.string(),
		lang: z.enum(['zh', 'en', 'ja']),
	}),
});

export const collections = { writing, resume };
