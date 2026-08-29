export function elementById<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.getElementById(id);
	if (!element) throw new Error(`Travel map requires #${id}`);
	return element as T;
}

export function queryElement<T extends Element = HTMLElement>(
	selector: string,
	root: ParentNode = document,
): T {
	const element = root.querySelector(selector);
	if (!element) throw new Error(`Travel map requires ${selector}`);
	return element as T;
}
