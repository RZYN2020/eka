# 旅行时间区间模型 Implementation Plan

**Goal:** 用递归地点时间区间和当前基地栈统一派生人生轨迹，删除 `oneWay`、`baseLike` 等路线特例。

**Architecture:** 顶层 `phase` 表示人生阶段，递归的 `stay` 表示持续驻留，`visit` 表示短暂访问。时间库负责区间与层级验证，路线库递归维护基地栈并生成真实事件及派生回程，地图脚本只消费统一节点和扁平路线。

**Tech Stack:** Astro 7、原生 ES Modules、Leaflet、Node.js `assert` 验证脚本、Puppeteer 浏览器回归。

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `src/lib/travel-time.js` | Modify | 校验部分 ISO 时间、点状访问、半开区间、父子包含、阶段连续性和稳定排序 |
| `src/lib/travel-journey.js` | Modify | 从递归地点节点和基地栈派生扁平 `JourneyStop` |
| `src/data/travel.js` | Modify | 将现有 `bases/trips/subtrips` 迁移为 `phase/stay/visit + children` 单一数据模型 |
| `src/scripts/travel-map.js` | Modify | 递归遍历地点、渲染地图/侧栏/统计，并适配新的路线节点类型 |
| `scripts/verify-travel-time.mjs` | Create | 独立验证时间区间、父子包含、阶段连续性与稳定排序 |
| `scripts/verify-travel-journey.mjs` | Modify | 覆盖区间校验、递归回程、阶段承接和真实数据事实 |
| `scripts/verify-map-runtime.mjs` | Modify | 覆盖真实事件刻度、2020 承接和现有地图控制行为 |
| `package.json` | Modify | 把独立时间区间验证加入统一 `pnpm verify` |
| `docs/specs/20260726-travel-time-intervals/key_info.md` | Modify | 回填执行计划路径 |

## Task 1: 建立递归时间区间验证

**FR coverage:** FR-2、FR-3、FR-4、FR-5、FR-12

**Files:**
- Modify: `src/lib/travel-time.js:1-36`
- Create: `scripts/verify-travel-time.mjs`

- [ ] **Step 1: Write the failing test**

创建 `scripts/verify-travel-time.mjs`，内容为：

```js
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

console.log('Travel time verification passed.');
```

- [ ] **Step 2: Verify test fails**

Run:

```bash
node scripts/verify-travel-time.mjs
```

Expected: FAIL，提示 `assertTravelTree` 未导出。

- [ ] **Step 3: Minimal implementation**

在 `src/lib/travel-time.js` 中保留现有日期格式化与稳定排序，并加入以下验证入口：

```js
const NODE_KINDS = new Set(['phase', 'stay', 'visit']);

function assertClosedDate(node) {
	const date = assertTravelDate(node);
	if (!Object.hasOwn(date, 'end')) {
		throw new Error(`${node.city} 缺少 date.end`);
	}
	if (node.kind !== 'phase' && date.end == null) {
		throw new Error(`${node.city} 缺少 date.end`);
	}
	if (node.kind === 'visit' && date.end !== date.start) {
		throw new Error(`${node.city} 的短暂访问必须满足 start = end`);
	}
	if (node.kind === 'stay' && date.end <= date.start) {
		throw new Error(`${node.city} 的持续驻留必须满足 start < end`);
	}
	return date;
}

function assertChildInside(parent, child) {
	const parentDate = parent.date;
	const childDate = child.date;
	const startsInside = childDate.start >= parentDate.start;
	const endsInside = child.kind === 'visit'
		? childDate.start < parentDate.end
		: childDate.end <= parentDate.end;
	if (!startsInside || !endsInside) {
		throw new Error(`${child.city} 的时间不在父级 ${parent.city} 内`);
	}
}

function assertNode(node, parent) {
	if (!NODE_KINDS.has(node.kind)) throw new Error(`${node.city} 的 kind 无效`);
	assertClosedDate(node);
	if (parent) assertChildInside(parent, node);
	const children = node.children || [];
	if (node.kind === 'visit' && children.length) {
		throw new Error(`${node.city} 的短暂访问不能包含子地点`);
	}
	const stays = sortByTravelDate(children.filter(child => child.kind === 'stay'));
	for (let index = 1; index < stays.length; index += 1) {
		if (stays[index - 1].date.end > stays[index].date.start) {
			throw new Error(`${stays[index - 1].city} 与 ${stays[index].city} 的持续驻留重叠`);
		}
	}
	children.forEach(child => assertNode(child, node));
}

export function assertTravelTree(phases) {
	const ordered = sortByTravelDate(phases);
	ordered.forEach((phase, index) => {
		if (phase.kind !== 'phase') throw new Error(`${phase.city} 不是主基地阶段`);
		if (index < ordered.length - 1 && phase.date.end == null) {
			throw new Error(`${phase.city} 不是最后阶段但缺少 date.end`);
		}
		if (index === ordered.length - 1 && phase.date.end !== null) {
			throw new Error(`${phase.city} 是当前阶段但 date.end 不是 null`);
		}
		assertNode(phase);
		if (index > 0 && ordered[index - 1].date.end !== phase.date.start) {
			throw new Error(`主基地阶段不连续: ${ordered[index - 1].city} → ${phase.city}`);
		}
	});
	return phases;
}
```

`assertClosedDate` 必须要求 `date` 对象显式拥有 `end` 字段；底层 `assertTravelDate`
继续兼容迁移前数据，树级验证负责新模型的严格契约。最后一个 `phase` 的 `end` 允许为
`null`，其他非空结束值继续使用部分 ISO 正则校验。区间比较使用
`(start, sequence)` 与 `(end, endSequence)` 元组；相同月份的事件因此仍能严格满足
半开区间，而无需补造具体日期。

- [ ] **Step 4: Verify test passes**

Run:

```bash
node scripts/verify-travel-time.mjs
```

Expected: `Travel time verification passed.`；现有旧路线测试不受本任务影响。

- [ ] **Step 5: Commit**

```bash
git add src/lib/travel-time.js scripts/verify-travel-time.mjs
git commit -m "Add travel interval validation"
```

## Task 2: 用基地栈递归派生路线

**FR coverage:** FR-6、FR-7、FR-8、FR-9、FR-10、FR-11、FR-13

**Files:**
- Modify: `src/lib/travel-journey.js:1-59`
- Test: `scripts/verify-travel-journey.mjs:1-150`

- [ ] **Step 1: Write the failing test**

删除旧结构夹具和生产数据断言，先只使用新模型的合成数据覆盖三个明确场景：

```js
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
```

另加点状访问不能承接阶段的夹具：

```js
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
```

- [ ] **Step 2: Verify test fails**

Run:

```bash
node scripts/verify-travel-journey.mjs
```

Expected: FAIL，因为旧生成器读取 `trips/baseLike/subtrips`，无法生成新递归路线。

- [ ] **Step 3: Minimal implementation**

将 `src/lib/travel-journey.js` 改为递归生成器：

```js
import { assertTravelTree, formatTravelDate, sortByTravelDate } from './travel-time.js';

function eventStop(place, fallbackAction) {
	return {
		city: place.city,
		province: place.province,
		date: { ...place.date },
		dateLabel: formatTravelDate(place),
		action: place.note || place.summary || fallbackAction,
		kind: place.kind,
		derived: false,
	};
}

function returnStop(base, source) {
	const point = {
		start: source.date.end,
		end: source.date.end,
		label: source.date.end.replaceAll('-', '.'),
		sequence: source.kind === 'visit'
			? source.date.sequence
			: source.date.endSequence,
	};
	return {
		city: base.city,
		province: base.province,
		date: point,
		dateLabel: point.label,
		action: `返回${base.city}`,
		kind: 'return',
		derived: true,
	};
}

function appendContainer(stops, container) {
	stops.push(eventStop(
		container,
		container.kind === 'phase' ? '主基地' : '次级基地',
	));
	const children = sortByTravelDate(container.children || []);
	children.forEach((child, index) => {
		if (child.kind === 'visit') {
			stops.push(eventStop(child, '旅行'));
			stops.push(returnStop(container, child));
			return;
		}
		appendContainer(stops, child);
		const isTerminalStay = index === children.length - 1
			&& child.date.end === container.date.end;
		if (!isTerminalStay) stops.push(returnStop(container, child));
	});
}

export function buildJourneyStops(phases) {
	assertTravelTree(phases);
	const stops = [];
	sortByTravelDate(phases).forEach(phase => appendContainer(stops, phase));
	return stops;
}
```

- [ ] **Step 4: Verify test passes**

Run:

```bash
node scripts/verify-travel-journey.mjs
```

Expected: 合成路线夹具 PASS；回程节点都具有 `derived: true`，阶段末尾 `stay` 后直接进入下一 `phase`。

- [ ] **Step 5: Commit**

```bash
git add src/lib/travel-journey.js scripts/verify-travel-journey.mjs
git commit -m "Derive journeys from nested stays"
```

## Task 3: 迁移真实旅行数据

**FR coverage:** FR-1、FR-2、FR-3、FR-4、FR-5、FR-15

**Files:**
- Modify: `src/data/travel.js:1-86`
- Test: `scripts/verify-travel-journey.mjs:100-180`

- [ ] **Step 1: Write the failing test**

在真实数据断言前先校验模型已经彻底迁移，并固定三组已确认事实：

```js
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
);
```

- [ ] **Step 2: Verify test fails**

Run:

```bash
node scripts/verify-travel-journey.mjs
```

Expected: FAIL，至少报告生产数据仍包含 `trips`、`baseLike` 或 `oneWay`。

- [ ] **Step 3: Minimal implementation**

按以下确定映射重写 `src/data/travel.js`：

| Existing data | New data |
| --- | --- |
| 顶层 `bases[]` | 保留导出名 `bases`，每项增加 `kind: 'phase'`，`trips` 改为 `children` |
| `baseLike: true` | `kind: 'stay'`，`subtrips` 改为 `children` |
| 普通 trip/subtrip | `kind: 'visit'`，增加 `date.end = date.start` |
| `oneWay: true` | 删除，由持续 `stay` 与父阶段共同结束表达 |
| 当前北京主基地 | `date: { start: '2026-06-27', end: null, label: '2026.6.27 — 至今' }` |

主基地阶段边界必须迁移为：

```js
[
	{ city: '庆阳', date: { start: '2002-03-22', end: '2017-09', label: '2002 — 2017' } },
	{ city: '兰州', date: { start: '2017-09', end: '2020-09', label: '2017.9 — 2020.9' } },
	{ city: '南京', date: { start: '2020-09', end: '2026-06-27', label: '2020.9 — 2026.6' } },
	{ city: '北京', date: { start: '2026-06-27', end: null, label: '2026.6.27 — 至今' } },
]
```

持续驻留必须明确为：

```js
[
	{ city: '庆阳', parent: '兰州', start: '2020-07', end: '2020-09', label: '2020.7 — 2020.9' },
	{ city: '杭州', parent: '南京', start: '2023-06', end: '2023-09' },
	{ city: '深圳', parent: '南京', start: '2025-06', end: '2025-09' },
	{ city: '北京', parent: '南京', start: '2025-12', end: '2026-05', endSequence: 4 },
	{ city: '庆阳', parent: '南京', start: '2026-05', end: '2026-06' },
]
```

所有原有 `city`、`province`、`color`、`slug`、`summary`、`note`、`label` 和
`sequence` 原样保留；同月结束边界用 `endSequence` 表达已知离开顺序，不伪造日级日期；
成都保持 `2018-06 / 2018 夏` 并作为兰州的 `visit`。

- [ ] **Step 4: Verify test passes**

Run:

```bash
node scripts/verify-travel-journey.mjs
```

Expected: PASS，且生产路线时间单调、成都从兰州往返、2020 年从庆阳进入南京；杭州与华北路线按 Task 5 的用户更正执行。

- [ ] **Step 5: Commit**

```bash
git add src/data/travel.js scripts/verify-travel-journey.mjs
git commit -m "Migrate travel data to intervals"
```

## Task 4: 让地图消费递归地点与新路线类型

**FR coverage:** FR-14、FR-16、SC-1 至 SC-6

**Files:**
- Modify: `src/scripts/travel-map.js:1-1125`
- Test: `scripts/verify-map-runtime.mjs:1-133`
- Modify: `package.json:9-18`
- Modify: `docs/specs/20260726-travel-time-intervals/key_info.md:15-24`

- [ ] **Step 1: Write the failing test**

把浏览器测试从固定旧类型与总数改为语义断言：

```js
const timelineMarkers = await page.evaluate(() => ({
	phases: document.querySelectorAll('#journeyTimeTicks .is-base').length,
	stays: document.querySelectorAll('#journeyTimeTicks .is-subbase').length,
	visits: document.querySelectorAll('#journeyTimeTicks .is-trip').length,
	derived: document.querySelectorAll('#journeyTimeTicks [data-derived="true"]').length,
}));
assert.equal(timelineMarkers.phases, 4);
assert.equal(timelineMarkers.stays, 5);
assert(timelineMarkers.visits >= 49);
assert.equal(timelineMarkers.derived, 0);
assert(
	await page.$('#journeyTimeTicks button[aria-label*="2020.7 — 2020.9 · 庆阳"]'),
	'时间轴应包含阶段末尾的庆阳持续驻留',
);
```

点击庆阳驻留刻度后执行下一步，验证紧邻节点就是南京：

```js
await page.click('#journeyTimeTicks button[aria-label*="2020.7 — 2020.9 · 庆阳"]');
await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '庆阳');
await page.click('#btnJourneyNext');
await page.waitForFunction(() => document.getElementById('journeyCity')?.textContent === '南京');
```

保留现有 Marker 分布、头像可见、放大、播放、下一步、点击、拖动及键盘断言。

- [ ] **Step 2: Verify test fails**

先运行生产构建，再运行地图测试：

```bash
pnpm exec astro build
pnpm check:map
```

Expected: FAIL，因为地图脚本仍读取 `trips/subtrips/baseLike`，旧路线类型也没有 `phase/stay/visit`。

- [ ] **Step 3: Minimal implementation**

在 `src/scripts/travel-map.js` 增加统一递归帮助函数，并用它替换坐标注入、已访问城市、省份、
Marker 上下文和统计中的重复两层遍历：

```js
function childrenOf(place) {
	return place.children || [];
}

function flattenPlaces(places) {
	return places.flatMap(place => [place, ...flattenPlaces(childrenOf(place))]);
}

function walkPlaces(places, visitor, ancestors = []) {
	places.forEach(place => {
		visitor(place, ancestors);
		walkPlaces(childrenOf(place), visitor, [...ancestors, place]);
	});
}
```

地图初始化必须调用：

```js
assertTravelTree(bases);
walkPlaces(bases, place => Object.assign(place, getCoords(place.city)));
```

侧栏保留现有两级视觉，但字段映射改为：

```js
const topLevel = sortByTravelDate(bases);
const childPlaces = sortByTravelDate(phase.children);
const isStay = place.kind === 'stay';
const nestedVisits = sortByTravelDate(place.children || []);
```

路线时间轴使用新类型并排除派生节点：

```js
function journeyDestinations() {
	return journey.stops
		.map((stop, index) => ({ stop, index }))
		.filter(({ stop }) => !stop.derived);
}

const markerClass = stop.kind === 'phase'
	? 'is-base'
	: stop.kind === 'stay' ? 'is-subbase' : 'is-trip';
```

地图聚焦层级改为：

```js
map.setView(
	[stop.lat, stop.lng],
	stop.kind === 'phase' ? 6 : 7,
	{ animate: false },
);
```

完成后删除本地 `validateTravelData`，统一使用 `assertTravelTree`；所有选择、侧栏、统计和
Marker 逻辑只读取 `children` 与 `kind`，不得再出现 `trips`、`subtrips`、`baseLike` 或
`oneWay`。

把纯时间验证加入统一校验命令：

```json
{
	"verify": "node scripts/verify-travel-time.mjs && node scripts/verify-travel-journey.mjs && node scripts/verify-build.mjs && node scripts/verify-content-styles.mjs"
}
```

- [ ] **Step 4: Verify test passes**

Run:

```bash
pnpm check
pnpm build
pnpm verify
pnpm check:map
git diff --check
```

Expected:

- Astro diagnostics: 0 errors、0 warnings；
- 生产构建和简历 PDF 生成成功；
- 旅行区间、内容链接与样式验证全部 PASS；
- 地图 Marker 不堆积，2020 年从庆阳进入南京；
- 播放、步进、时间轴拖动与键盘控制全部 PASS；
- diff 无空白错误。

- [ ] **Step 5: Commit**

```bash
git add src/scripts/travel-map.js scripts/verify-map-runtime.mjs package.json docs/specs/20260726-travel-time-intervals/key_info.md
git commit -m "Adapt map to travel intervals"
```

## Execution Order & Risks

1. Task 1 必须先建立数据契约，Task 2 才能安全消费递归节点。
2. Task 2 的合成路线通过后再迁移生产数据，避免把算法错误和数据错误混在一起。
3. Task 3 完成后地图页面会暂时无法消费新结构；必须立即执行 Task 4，不在中间状态部署。
4. 当前工作区包含此前已确认但尚未提交的站点改动。执行时每个 `git add` 只暂存 Files
   块列出的路径；若同一文件包含前序改动，提交前必须审查完整 staged diff。
5. 不在本计划中执行 GitHub push 或 Cloudflare 部署；全部本地验证通过后再回到发布流程。

## Task 5: 支持显式连续行程并修正 2023 路线

**FR coverage:** FR-17、FR-18、FR-19

**Files:**
- Modify: `src/lib/travel-time.js`
- Modify: `src/lib/travel-journey.js`
- Modify: `src/data/travel.js`
- Modify: `src/scripts/travel-map.js`
- Modify: `scripts/verify-travel-time.mjs`
- Modify: `scripts/verify-travel-journey.mjs`

- [ ] **Step 1: Write the failing test**

在 `scripts/verify-travel-journey.mjs` 增加合成连续行程，断言共享 `journeyId` 的相邻访问
生成 `南京 → 青岛 → 淄博 → 泰安 → 北京 → 南京`，中间没有派生回程。同时增加真实
数据断言：杭州子事件只包含嘉兴和南京，不再包含庆阳；完整路线符合 FR-18；嘉兴使用
城市数据坐标并保留用户确认的备注。在 `scripts/verify-travel-time.mjs` 增加季节值校验与排序，
确保“2023 夏”不通过伪造月份表达。

- [ ] **Step 2: Verify test fails**

Run:

```bash
node scripts/verify-travel-journey.mjs
```

Expected: FAIL，现有实现会在华北行程每个地点后插入南京。

- [ ] **Step 3: Minimal implementation**

路线生成器按相邻、相同的非空 `journeyId` 对 `visit` 分组；组内只追加真实事件，最后
统一追加一次返回当前基地。普通访问和 `stay` 逻辑不变。生产数据删除杭州下的庆阳访问，
加入嘉兴、南京夏令营和华北行程分组。嘉兴使用城市数据坐标。时间库接受
`YYYY-spring/summer/autumn/winter` 并归一化排序，页面继续显示
原始 `label`。

- [ ] **Step 4: Verify test passes**

Run:

```bash
node scripts/verify-travel-journey.mjs
node scripts/verify-travel-time.mjs
pnpm check
pnpm exec astro build
git diff --check
```

Expected: 路线、数据、类型检查和生产构建全部通过。

- [ ] **Step 5: Commit**

按 bulk 模式留待站点全部清理和验收后统一提交。

## Task 6: 统一人生足迹、键盘操作与 Marker 稳定性

**FR coverage:** FR-20、FR-21、FR-22、FR-23

**Files:**
- Modify: `src/pages/map/index.astro`
- Modify: `scripts/migrate-custom-pages.mjs`
- Modify: `src/data/travel.js`
- Modify: `src/scripts/travel-map.js`
- Modify: `src/styles/map-theme.css`
- Modify: `scripts/verify-travel-journey.mjs`
- Modify: `scripts/verify-map-runtime.mjs`

- [ ] **Step 1: Write the failing test**

数据回归断言云南路线只在昆明后返回南京。浏览器回归通过 J 启动人生足迹、Space 暂停、
左右方向键步进、Escape 退出；悬停时间线地点后检查 Leaflet Marker 外层仍保留定位
`translate3d` 且没有 transform transition，再缩放并检查 Marker 没有偏移或堆积。

- [ ] **Step 2: Verify test fails**

Run:

```bash
node scripts/verify-travel-journey.mjs
pnpm exec astro build
pnpm check:map
```

Expected: 云南地点之间出现多次南京；全局快捷键无效；悬停后 Marker 外层 transform 被
替换为 `scale(1.4)`。

- [ ] **Step 3: Minimal implementation**

云南四个访问共享一个 `journeyId`。页面和迁移模板统一使用“人生足迹”。全局键盘处理器
避开按钮、链接、输入框、时间轴和 Leaflet 地图；只在人生轨迹语境中处理播放与步进。
Marker 强调改为切换外层状态类，由 CSS `scale` 单独缩放内层图形，Leaflet 的定位 transform
和缩放动画保持默认行为。

- [ ] **Step 4: Verify test passes**

Run:

```bash
node scripts/verify-travel-journey.mjs
pnpm check
pnpm build
pnpm verify
pnpm check:map
git diff --check
```

- [ ] **Step 5: Commit**

按 bulk 模式留待全站最终验收后统一提交。

## Task 7: 补全 2023–2026 已确认连续路线

**FR coverage:** FR-7、FR-18、FR-19、FR-22、FR-24

**Files:**
- Modify: `src/data/travel.js`
- Modify: `scripts/verify-travel-journey.mjs`

- [ ] **Step 1: Write the failing test**

生产数据回归分别固定嘉兴、云南后杭州、2025 江南、深圳—珠海—澳门、2026 珠海—香港、
东北和六月长途路线，并断言中途不插入基地、重复珠海节点存在、六月庆阳不是 `stay`。

- [ ] **Step 2: Verify test fails**

Run:

```bash
node scripts/verify-travel-journey.mjs
```

Expected: 旧数据仍显示乌镇；多段路线在每站后自动返回基地；2026.6 地点顺序与事实不符。

- [ ] **Step 3: Minimal implementation**

将乌镇节点改为嘉兴并移除显式乌镇坐标；为每段用户明确给出顺序的连续路线分配独立
`journeyId`，需要显式折返珠海时保留第二个珠海节点；将 2026.6 庆阳从 `stay` 改为
南京出发连续路线的第一个 `visit`。不改变路线生成算法。

- [ ] **Step 4: Verify test passes**

Run:

```bash
node scripts/verify-travel-journey.mjs
pnpm check
pnpm build
pnpm verify
pnpm check:map
git diff --check
```

- [ ] **Step 5: Commit**

按 bulk 模式留待全站最终验收后统一提交。

## Spec Coverage Matrix

| Spec | Task |
| --- | --- |
| FR-2、FR-3、FR-4、FR-5、FR-12 | Task 1 |
| FR-6、FR-7、FR-8、FR-9、FR-10、FR-11、FR-13 | Task 2 |
| FR-1、FR-15 | Task 3 |
| FR-14、FR-16 | Task 4 |
| FR-17、FR-18、FR-19 | Task 5 |
| FR-20、FR-21、FR-22、FR-23 | Task 6 |
| FR-7、FR-18、FR-19、FR-22、FR-24 | Task 7 |
| SC-1、SC-2、SC-3、SC-4、SC-5、SC-6 | Tasks 1–4，Task 4 全量出口验证 |
| SC-7、SC-8、SC-9 | Tasks 5–7 |
