import type { WritingEntry } from './content';
import { site } from '../config/site';
import { formatDate, sortWriting, writingSlug } from './content';

export function latestWriting(entries: WritingEntry[], limit = 3) {
	return sortWriting(entries.filter((entry) => !entry.data.draft)).slice(0, limit);
}

export function renderTerminal(entries: WritingEntry[]) {
	const posts = latestWriting(entries)
		.map((entry, index) => {
			const date = formatDate(entry.data.publishedAt, 'zh-CN');
			const url = `${site.url}/writing/${writingSlug(entry.id)}/`;
			return `${index + 1}. ${entry.data.title}\n   ${date ? `${date}  ` : ''}${url}`;
		})
		.join('\n\n');

	return String.raw`
  ______ _
 |  ____| |
 | |__  | | ____ _
 |  __| | |/ / _' |
 | |____|   < (_| |
 |______|_|\_\__,_|

 ${site.title} · Writing, code, and life.

 Latest writing
 ────────────────────────────────────────────────────────────
${posts}

 Home    ${site.url}
 RSS     ${site.url}${site.links.rss}
`.trimStart();
}
