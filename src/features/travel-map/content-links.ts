const blogTitles: Record<string, string> = {
	qinhuai: '秦淮',
	yangzhou: '扬州游记',
	lushan: '庐山游记',
};

const externalArrow =
	'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

export function articleLink(slug?: string, { compact = false }: { compact?: boolean } = {}) {
	if (!slug) return '';
	const title = blogTitles[slug] ?? '相关文章';
	const size = compact ? '' : ' width="11" height="11"';
	return `<a href="/writing/${slug}/" target="_blank" rel="noopener" class="blink" onclick="event.stopPropagation()" title="相关文章">${title}${externalArrow.replace('<svg', `<svg${size}`)}</a>`;
}
