import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveNeoDBUrl } from '../src/lib/neodb.js';

const source = 'https://neodb.social';

assert.equal(
	resolveNeoDBUrl('/book/0aRMIDLyWn2RbDgk6IXTyu', source),
	'https://neodb.social/book/0aRMIDLyWn2RbDgk6IXTyu',
	'NeoDB API 返回的相对条目地址必须解析到 NeoDB，而不是本站',
);
assert.equal(
	resolveNeoDBUrl('https://neodb.social/book/example', source),
	'https://neodb.social/book/example',
	'已经是绝对地址时不应改变',
);

const shelf = JSON.parse(await readFile(
	new URL('../src/data/neodb/shelf.json', import.meta.url),
	'utf8',
));
const marks = Object.values(shelf.shelves).flat();
assert(
	marks.every(mark => new URL(resolveNeoDBUrl(mark.item.url, shelf.source)).origin === source),
	'书影音条目最终都必须指向 NeoDB',
);

const mediaHtml = await readFile(
	new URL('../dist/media/index.html', import.meta.url),
	'utf8',
);
assert(
	mediaHtml.includes('https://neodb.social/book/0aRMIDLyWn2RbDgk6IXTyu'),
	'生产 Media 页面必须包含指向 NeoDB 的《社会学》链接',
);
assert(
	mediaHtml.includes('阅读笔记 · 吉登斯「社会学」笔记'),
	'生产 Media 页面必须显示已关联的站内阅读笔记',
);
const progressFilter = mediaHtml.indexOf(
	'data-filter-group="status" data-filter="progress" aria-pressed="true"',
);
const completeFilter = mediaHtml.indexOf(
	'data-filter-group="status" data-filter="complete"',
);
const allFilter = mediaHtml.indexOf(
	'data-filter-group="status" data-filter="all"',
);
assert(
	progressFilter >= 0 && progressFilter < completeFilter && completeFilter < allFilter,
	'Media 状态筛选必须默认进行中，并把全部放在最后',
);

console.log('NeoDB verification passed.');
