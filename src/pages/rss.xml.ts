import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortWriting, writingDescription, writingSlug } from '../lib/content';
import { site } from '../config/site';

export async function GET(context: { site: URL }) {
	const entries = sortWriting((await getCollection('writing')).filter((entry) => !entry.data.draft));
	return rss({
		title: site.title,
		description: site.description,
		site: context.site,
		items: entries.map((entry) => ({
			title: entry.data.title,
			description: writingDescription(entry),
			pubDate: entry.data.publishedAt,
			link: `/writing/${writingSlug(entry.id)}/`,
		})),
	});
}
