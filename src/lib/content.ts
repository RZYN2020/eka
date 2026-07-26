import type { CollectionEntry } from 'astro:content';
import { site } from '../config/site';
import { taxonomySlug } from '../config/taxonomy';

export type WritingEntry = CollectionEntry<'writing'>;

function markdownToPlainText(markdown: string) {
	return markdown
		.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
		.replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^\s*#{1,6}\s+/gm, '')
		.replace(/^\s*>\s?/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/[*_~]/g, '')
		.replace(/\\([\\`*_[\]{}()#+\-.!])/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

export function writingDescription(entry: WritingEntry, maxLength = 160) {
	const explicit = entry.data.description.trim();
	if (explicit) return explicit;

	const plainText = markdownToPlainText(entry.body ?? '');
	if (!plainText) return site.description;

	const characters = Array.from(plainText);
	return characters.length > maxLength
		? `${characters.slice(0, maxLength - 1).join('').trimEnd()}…`
		: plainText;
}

export function writingSlug(id: string) {
	return id
		.replace(/\/index$/, '')
		.replace(/^algorithm\//, '');
}

export const tagSlug = taxonomySlug;
export const categorySlug = taxonomySlug;

export function getTagCounts(entries: WritingEntry[]) {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		for (const tag of entry.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, 'zh-CN'));
}

export function formatDate(date?: Date, locale = 'zh-CN') {
	if (!date) return '';
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}

export function sortWriting(entries: WritingEntry[]) {
	return entries.toSorted((a, b) => {
		const dateOrder = (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0);
		if (dateOrder !== 0) return dateOrder;
		const manualOrder = a.data.order - b.data.order;
		if (manualOrder !== 0) return manualOrder;
		return a.data.title.localeCompare(b.data.title, 'zh-CN');
	});
}
