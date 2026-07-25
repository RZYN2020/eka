import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortWriting, writingSlug } from '../lib/content';

export async function GET(context: { site: URL }) {
	const entries = sortWriting((await getCollection('writing')).filter((entry) => !entry.data.draft));
	return rss({
		title: 'Eka · 赵勇臻',
		description: '写技术、社会与个人经验。',
		site: context.site,
		items: entries.map((entry) => ({
			title: entry.data.title,
			description: entry.data.description || undefined,
			pubDate: entry.data.publishedAt,
			link: `/writing/${writingSlug(entry.id)}/`,
		})),
	});
}
