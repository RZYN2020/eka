import type { CollectionEntry } from 'astro:content';

export type WritingEntry = CollectionEntry<'writing'>;
export type NoteEntry = CollectionEntry<'notes'>;

export const writingKindLabel = {
	essay: 'Essay',
	technical: 'Technical',
	journal: 'Journal',
} as const;

export const noteSourceLabel = {
	blog: 'Knowledge',
	algorithm: 'Algorithm',
} as const;

export function writingSlug(id: string) {
	return id.replace(/\/index$/, '');
}

export function noteSlug(id: string) {
	return id.replace(/\/index$/, '');
}

export function tagSlug(tag: string) {
	return tag
		.normalize('NFKC')
		.trim()
		.toLocaleLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^\p{Letter}\p{Number}-]+/gu, '')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '');
}

export function getTagCounts(entries: Array<WritingEntry | NoteEntry>) {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		for (const tag of entry.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, 'zh-CN'));
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
