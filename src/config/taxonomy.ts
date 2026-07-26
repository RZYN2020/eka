import { categories, formTags } from './taxonomy-data.js';

export { categories, formTags };

export function taxonomySlug(value: string) {
	return value
		.normalize('NFKC')
		.trim()
		.toLocaleLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^\p{Letter}\p{Number}-]+/gu, '')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '');
}

export function isFormTag(tag: string) {
	return formTags.includes(tag);
}
