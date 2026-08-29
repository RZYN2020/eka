import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categories } from './config/taxonomy';

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
		toc: z.boolean().default(true),
		neodbIds: z.array(z.string()).default([]),
		legacyUrls: z.array(z.string()).default([]),
	}).superRefine((entry, context) => {
		const category = categories.find((candidate) => candidate.name === entry.category);
		if (!category) {
			context.addIssue({
				code: 'custom',
				path: ['category'],
				message: `Unknown category "${entry.category}".`,
			});
			return;
		}

		for (const [index, subcategory] of entry.subcategories.entries()) {
			if (!(category.subcategories as readonly string[]).includes(subcategory)) {
				context.addIssue({
					code: 'custom',
					path: ['subcategories', index],
					message: `"${subcategory}" is not a child of "${entry.category}".`,
				});
			}
		}
	}),
});

export const collections = { writing };
