import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
	schema: z.object({
		title: z.string(),
		description: z.string().default(''),
		publishedAt: z.coerce.date(),
		updatedAt: z.coerce.date().optional(),
		kind: z.enum(['essay', 'technical', 'journal']),
		topics: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
		featured: z.boolean().default(false),
		legacyUrls: z.array(z.string()).default([]),
	}),
});

const notes = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
	schema: z.object({
		title: z.string(),
		description: z.string().default(''),
		topic: z.string().default('Notes'),
		publishedAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		order: z.number().default(999),
		draft: z.boolean().default(false),
		source: z.enum(['blog', 'algorithm']).default('blog'),
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

export const collections = { writing, notes, resume };
