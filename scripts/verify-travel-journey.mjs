import assert from 'node:assert/strict';
import { bases as actualBases } from '../src/data/travel.js';
import { buildJourneyStops } from '../src/lib/travel-journey.js';
import { compareTravelDates } from '../src/lib/travel-time.js';

const intervalStops = buildJourneyStops([
	{
		kind: 'phase',
		city: '南京',
		province: '江苏',
		date: { start: '2020-09', end: '2026-06-27' },
		children: [
			{
				kind: 'visit',
				city: '扬州',
				province: '江苏',
				date: { start: '2025-05', end: '2025-05' },
			},
			{
				kind: 'stay',
				city: '深圳',
				province: '广东',
				date: { start: '2025-06', end: '2025-09' },
				children: [
					{
						kind: 'visit',
						city: '广州',
						province: '广东',
						date: { start: '2025-08', end: '2025-08' },
					},
				],
			},
			{
				kind: 'stay',
				city: '庆阳',
				province: '甘肃',
				date: { start: '2026-05', end: '2026-06-27' },
				children: [],
			},
		],
	},
	{
		kind: 'phase',
		city: '北京',
		province: '北京',
		date: { start: '2026-06-27', end: null },
		children: [],
	},
]);

assert.deepEqual(
	intervalStops.map(({ city }) => city),
	['南京', '扬州', '南京', '深圳', '广州', '深圳', '南京', '庆阳', '北京'],
);
assert.deepEqual(
	intervalStops.filter(({ derived }) => derived).map(({ action }) => action),
	['返回南京', '返回深圳', '返回南京'],
);
assert.equal(intervalStops.at(-2).kind, 'stay');
assert.equal(intervalStops.at(-1).kind, 'phase');

const pointAtEnd = buildJourneyStops([
	{
		kind: 'phase',
		city: '甲地',
		province: '甲省',
		date: { start: '2020-01', end: '2021-01' },
		children: [{
			kind: 'visit',
			city: '乙地',
			province: '乙省',
			date: { start: '2020-12', end: '2020-12' },
		}],
	},
	{
		kind: 'phase',
		city: '丙地',
		province: '丙省',
		date: { start: '2021-01', end: null },
		children: [],
	},
]);
assert.deepEqual(
	pointAtEnd.map(({ city }) => city),
	['甲地', '乙地', '甲地', '丙地'],
);

const coarseEndStops = buildJourneyStops([
	{
		kind: 'phase',
		city: '甲地',
		province: '甲省',
		date: { start: '2020-01', end: '2021-01', endSequence: 5 },
		children: [{
			kind: 'stay',
			city: '乙地',
			province: '乙省',
			date: { start: '2020-12', end: '2021-01', endSequence: 4 },
			children: [],
		}],
	},
	{
		kind: 'phase',
		city: '丙地',
		province: '丙省',
		date: { start: '2021-01', end: null, sequence: 5 },
		children: [],
	},
]);
assert.deepEqual(
	coarseEndStops.map(({ city }) => city),
	['甲地', '乙地', '甲地', '丙地'],
	'同月但早于阶段边界结束的 stay 仍应返回主基地',
);

const continuousTripStops = buildJourneyStops([
	{
		kind: 'phase',
		city: '南京',
		province: '江苏',
		date: { start: '2023-01', end: null },
		children: [
			{
				kind: 'visit',
				journeyId: 'north-china-2023',
				city: '青岛',
				province: '山东',
				date: { start: '2023-09', end: '2023-09', sequence: 1 },
			},
			{
				kind: 'visit',
				journeyId: 'north-china-2023',
				city: '淄博',
				province: '山东',
				date: { start: '2023-09', end: '2023-09', sequence: 2 },
			},
			{
				kind: 'visit',
				journeyId: 'north-china-2023',
				city: '泰安',
				province: '山东',
				date: { start: '2023-09', end: '2023-09', sequence: 3 },
			},
			{
				kind: 'visit',
				journeyId: 'north-china-2023',
				city: '北京',
				province: '北京',
				date: { start: '2023-09', end: '2023-09', sequence: 4 },
			},
		],
	},
]);
assert.deepEqual(
	continuousTripStops.map(({ city }) => city),
	['南京', '青岛', '淄博', '泰安', '北京', '南京'],
	'显式连续行程只能在最后一个地点后返回基地',
);
assert.equal(
	continuousTripStops.filter(({ derived }) => derived).length,
	1,
	'连续行程只派生一次最终回程',
);

function flatten(nodes) {
	return nodes.flatMap(node => [node, ...flatten(node.children || [])]);
}

const actualNodes = flatten(actualBases);
assert(actualNodes.every(node => ['phase', 'stay', 'visit'].includes(node.kind)));
assert(actualNodes.every(node => Object.hasOwn(node.date, 'end')));
assert(actualNodes.every(node => !Object.hasOwn(node, 'oneWay')));
assert(actualNodes.every(node => !Object.hasOwn(node, 'baseLike')));
assert(actualNodes.every(node => !Object.hasOwn(node, 'trips')));
assert(actualNodes.every(node => !Object.hasOwn(node, 'subtrips')));

const actualStops = buildJourneyStops(actualBases);
assert(
	actualStops.every((stop, index) =>
		index === 0 || compareTravelDates(actualStops[index - 1], stop) <= 0),
	'真实轨迹必须按机器时间与同月顺序单调排列',
);
const chengdu = actualStops.findIndex(stop => stop.city === '成都');
assert.deepEqual(
	actualStops.slice(chengdu - 1, chengdu + 2).map(({ city }) => city),
	['兰州', '成都', '兰州'],
);

const nanjing = actualStops.findIndex(stop => stop.kind === 'phase' && stop.city === '南京');
assert.deepEqual(
	actualStops.slice(nanjing - 1, nanjing + 1).map(({ city }) => city),
	['庆阳', '南京'],
);

const hangzhou = actualStops.findIndex(stop => stop.kind === 'stay' && stop.city === '杭州');
assert.deepEqual(
	actualStops.slice(hangzhou, hangzhou + 12).map(({ city }) => city),
	['杭州', '嘉兴', '杭州', '南京', '杭州', '南京', '青岛', '淄博', '泰安', '北京', '南京', '庆阳'],
	'2023 路线必须从杭州完成两次往返，再从南京连续完成华北旅行',
);
const hangzhouNode = actualNodes.find(node => node.kind === 'stay' && node.city === '杭州');
assert.deepEqual(
	hangzhouNode.children.map(({ city }) => city),
	['嘉兴', '南京'],
	'杭州实习期间没有返回庆阳',
);
const jiaxing = hangzhouNode.children[0];
assert.equal(jiaxing.note, '与家人前往嘉兴旅行');
assert(!Object.hasOwn(jiaxing, 'coordinates'), '嘉兴应由城市数据定位，不再使用乌镇坐标');

const yunnan = actualStops.findIndex(stop => stop.city === '西双版纳');
assert.deepEqual(
	actualStops.slice(yunnan - 1, yunnan + 7).map(({ city }) => city),
	['南京', '西双版纳', '大理', '丽江', '昆明', '南京', '杭州', '南京'],
	'云南旅行必须从南京连续出发，返回后再从南京往返杭州参加编译比赛',
);
assert(
	actualNodes
		.filter(node => ['西双版纳', '大理', '丽江', '昆明'].includes(node.city))
		.every(node => node.journeyId === 'yunnan-2024'),
	'云南四个地点必须共享显式连续行程标识',
);

const jiangnan = actualStops.findIndex(
	stop => stop.city === '苏州' && stop.date.start === '2025-12',
);
assert.deepEqual(
	actualStops.slice(jiangnan - 1, jiangnan + 3).map(({ city }) => city),
	['南京', '苏州', '上海', '南京'],
	'2025 江南旅行必须从南京连续经过苏州、上海后返回南京',
);

const shenzhenZhuhai = actualStops.findIndex(
	stop => stop.city === '珠海' && stop.date.start === '2025-08',
);
assert.deepEqual(
	actualStops.slice(shenzhenZhuhai - 1, shenzhenZhuhai + 4).map(({ city }) => city),
	['深圳', '珠海', '澳门', '珠海', '深圳'],
	'2025 深珠澳路线必须保留澳门后返回珠海再回深圳',
);

const beijingZhuhai = actualStops.findIndex(
	stop => stop.city === '珠海' && stop.date.start === '2026-03',
);
assert.deepEqual(
	actualStops.slice(beijingZhuhai - 1, beijingZhuhai + 4).map(({ city }) => city),
	['北京', '珠海', '香港', '珠海', '北京'],
	'2026 珠港路线必须保留香港后返回珠海再回北京',
);

const northeast = actualStops.findIndex(
	stop => stop.city === '哈尔滨' && stop.date.start === '2026-05',
);
assert.deepEqual(
	actualStops.slice(northeast - 1, northeast + 4).map(({ city }) => city),
	['北京', '哈尔滨', '长春', '沈阳', '北京'],
	'2026 东北旅行必须从北京连续完成并返回北京',
);

const juneJourney = actualStops.findIndex(
	stop => stop.city === '庆阳' && stop.date.start === '2026-06',
);
assert.deepEqual(
	actualStops.slice(juneJourney - 1, juneJourney + 10).map(({ city }) => city),
	['南京', '庆阳', '西安', '珠海', '深圳', '惠州', '广州', '南昌', '九江', '南京', '北京'],
	'2026.6 必须从南京连续旅行、返回南京后再进入北京工作阶段',
);
const juneQingyang = actualNodes.find(
	node => node.city === '庆阳' && node.date.start === '2026-06',
);
assert.equal(juneQingyang?.kind, 'visit', '2026.6 庆阳是连续行程访问，不是次基地');
assert.equal(juneQingyang?.journeyId, 'southbound-2026-06');

console.log('Travel journey verification passed.');
