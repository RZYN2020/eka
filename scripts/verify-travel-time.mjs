import assert from 'node:assert/strict';
import {
	assertTravelTree,
	sortByTravelDate,
} from '../src/lib/travel-time.js';

const validTree = [
	{
		kind: 'phase',
		city: '兰州',
		date: { start: '2017-09', end: '2020-09' },
		children: [
			{
				kind: 'visit',
				city: '成都',
				date: { start: '2018-06', end: '2018-06', label: '2018 夏' },
			},
			{
				kind: 'stay',
				city: '庆阳',
				date: { start: '2020-07', end: '2020-09' },
				children: [],
			},
		],
	},
	{
		kind: 'phase',
		city: '南京',
		date: { start: '2020-09', end: '2026-06-27' },
		children: [],
	},
	{
		kind: 'phase',
		city: '北京',
		date: { start: '2026-06-27', end: null },
		children: [],
	},
];

assert.doesNotThrow(() => assertTravelTree(validTree));
assert.throws(
	() => assertTravelTree([{
		kind: 'phase',
		city: '南京',
		date: { start: '2020-09', end: '2021-09' },
		children: [{
			kind: 'visit',
			city: '北京',
			date: { start: '2021-09', end: '2021-09' },
		}],
	}]),
	/北京.*父级.*南京/,
);
assert.throws(
	() => assertTravelTree([
		{
			kind: 'phase',
			city: '兰州',
			date: { start: '2017-09', end: '2020-07' },
			children: [],
		},
		{
			kind: 'phase',
			city: '南京',
			date: { start: '2020-09', end: null },
			children: [],
		},
	]),
	/主基地阶段不连续/,
);
assert.deepEqual(
	sortByTravelDate([
		{ city: '乙', date: { start: '2025-08', end: '2025-08', sequence: 2 } },
		{ city: '甲', date: { start: '2025-08', end: '2025-08', sequence: 1 } },
		{ city: '丙', date: { start: '2025-08', end: '2025-08', sequence: 2 } },
	]).map(({ city }) => city),
	['甲', '乙', '丙'],
);
assert.deepEqual(
	sortByTravelDate([
		{ city: '秋', date: { start: '2023-autumn', end: '2023-autumn' } },
		{ city: '夏二', date: { start: '2023-summer', end: '2023-summer', sequence: 2 } },
		{ city: '夏一', date: { start: '2023-summer', end: '2023-summer', sequence: 1 } },
	]).map(({ city }) => city),
	['夏一', '夏二', '秋'],
	'季节值必须保持真实精度并可稳定排序',
);

const coarseBoundary = [
	{
		kind: 'phase',
		city: '南京',
		date: { start: '2025-01', end: '2026-06' },
		children: [{
			kind: 'stay',
			city: '北京',
			date: { start: '2025-12', end: '2026-05', sequence: 4, endSequence: 4 },
			children: [{
				kind: 'visit',
				city: '沈阳',
				date: { start: '2026-05', end: '2026-05', sequence: 3 },
			}],
		}],
	},
	{
		kind: 'phase',
		city: '庆阳',
		date: { start: '2026-06', end: null },
		children: [],
	},
];
assert.doesNotThrow(() => assertTravelTree(coarseBoundary));
coarseBoundary[0].children[0].children[0].date.sequence = 4;
assert.throws(
	() => assertTravelTree(coarseBoundary),
	/沈阳.*父级.*北京/,
	'同月事件必须严格早于 stay 的 endSequence',
);

assert.doesNotThrow(() => assertTravelTree([{
	kind: 'phase',
	city: '北京',
	date: { start: '2026-06-27', end: null },
	children: [{
		kind: 'visit',
		city: '天津',
		date: { start: '2026-08', end: '2026-08' },
	}],
}]), '当前开放阶段应允许继续添加旅行');

assert.doesNotThrow(() => assertTravelTree([{
	kind: 'phase',
	city: '南京',
	date: { start: '2023-01', end: null },
	children: [{
		kind: 'stay',
		city: '杭州',
		date: { start: '2023-06', end: '2023-09' },
		children: [{
			kind: 'visit',
			city: '乌镇',
			date: { start: '2023-summer', end: '2023-summer', label: '2023 夏' },
		}],
	}],
}]), '季节级访问必须能被包含在对应的基地时间区间内');

assert.throws(
	() => assertTravelTree([{
		kind: 'phase',
		city: '南京',
		date: { start: '2023-01', end: null },
		journeyId: 'invalid-on-base',
		children: [],
	}]),
	/journeyId.*visit/,
	'连续行程标识只能出现在短暂访问上',
);
assert.throws(
	() => assertTravelTree([{
		kind: 'phase',
		city: '南京',
		date: { start: '2023-01', end: null },
		children: [{
			kind: 'visit',
			city: '青岛',
			date: { start: '2023-09', end: '2023-09' },
			journeyId: '   ',
		}],
	}]),
	/journeyId.*非空字符串/,
	'连续行程标识必须是非空字符串',
);

assert.throws(
	() => assertTravelTree([{
		kind: 'phase',
		city: '北京',
		date: { start: '2026-06-27', end: null },
		children: [{
			kind: 'phase',
			city: '天津',
			date: { start: '2026-08', end: '2026-09' },
			children: [],
		}],
	}]),
	/天津.*主基地阶段.*嵌套/,
);

console.log('Travel time verification passed.');
