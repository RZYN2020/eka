export const categories = [
	{ name: 'Tech', subcategories: ['AI', 'System', 'Backend', 'Application', 'Algorithm'] },
	{ name: 'Human', subcategories: ['Sociology', 'Economics'] },
	{ name: 'Life', subcategories: ['Instinct', 'Journal'] },
] as const;

export const formTags = [
	'Book',
	'Code',
	'CheatSheet',
	'Reflection',
	'Summary',
	'Interview',
	'Knowledge',
	'Share',
] as const;

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
	return (formTags as readonly string[]).includes(tag);
}
