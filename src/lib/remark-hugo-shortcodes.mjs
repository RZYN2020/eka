const rawHtmlMarker = /\{\{[%<]\s*\/?rawhtml\s*[%>]\}\}/gi;
const commentOpen = /^\{\{[%<]\s*comment\s*[%>]\}\}$/i;
const commentClose = /^\{\{[%<]\s*\/comment\s*[%>]\}\}$/i;

function textContent(node) {
	if (typeof node.value === 'string') return node.value;
	if (!Array.isArray(node.children)) return '';
	return node.children.map(textContent).join('');
}

function stripRawHtmlMarkers(node) {
	if (typeof node.value === 'string') {
		node.value = node.value.replace(rawHtmlMarker, '');
	}
	if (Array.isArray(node.children)) {
		node.children.forEach(stripRawHtmlMarkers);
	}
}

function isEmptyMarkerParagraph(node) {
	if (node.type !== 'paragraph') return false;
	return !node.children?.some((child) => {
		if (['image', 'imageReference', 'break'].includes(child.type)) return true;
		if (typeof child.value === 'string') return child.value.trim() !== '';
		return child.children?.some((nested) => textContent(nested).trim() !== '');
	});
}

function processChildren(parent) {
	if (!Array.isArray(parent.children)) return;

	const visible = [];
	let commentDepth = 0;

	for (const child of parent.children) {
		const marker = textContent(child).trim();

		if (commentOpen.test(marker)) {
			commentDepth += 1;
			continue;
		}
		if (commentClose.test(marker)) {
			commentDepth = Math.max(0, commentDepth - 1);
			continue;
		}
		if (commentDepth > 0) continue;

		processChildren(child);
		stripRawHtmlMarkers(child);
		if (isEmptyMarkerParagraph(child)) continue;
		visible.push(child);
	}

	parent.children = visible;
}

export default function remarkHugoShortcodes() {
	return (tree) => {
		processChildren(tree);
	};
}
