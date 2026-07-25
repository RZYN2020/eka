import type { CollectionEntry } from 'astro:content';

export type WritingEntry = CollectionEntry<'writing'>;
export type NoteEntry = CollectionEntry<'notes'>;

export const writingKindLabel = {
	essay: '思想',
	technical: '技术',
	journal: '手记',
} as const;

export function writingSlug(id: string) {
	return id.replace(/\/index$/, '');
}

export function noteSlug(id: string) {
	return id.replace(/\/index$/, '');
}

export function formatDate(date?: Date, locale = 'zh-CN') {
	if (!date) return '持续更新';
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}

export function sortWriting(entries: WritingEntry[]) {
	return entries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function sortNotes(entries: NoteEntry[]) {
	return entries.sort((a, b) => {
		const order = a.data.order - b.data.order;
		if (order !== 0) return order;
		return (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0);
	});
}

export function plainExcerpt(body: string, fallback = '', length = 126) {
	if (fallback) return fallback;
	const text = body
		.replace(/^---[\s\S]*?---/m, '')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/[#>*_`~+-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}
