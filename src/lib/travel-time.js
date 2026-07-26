const PARTIAL_ISO_DATE = /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;
const SEASON_DATE = /^(\d{4})-(spring|summer|autumn|winter)$/;
const SEASON_MONTH = {
	spring: '03',
	summer: '06',
	autumn: '09',
	winter: '12',
};
const NODE_KINDS = new Set(['phase', 'stay', 'visit']);

function isTravelDate(value) {
	return PARTIAL_ISO_DATE.test(value) || SEASON_DATE.test(value);
}

function normalizedDate(value) {
	const season = value.match(SEASON_DATE);
	if (season) return `${season[1]}-${SEASON_MONTH[season[2]]}-01`;
	const [year, month = '01', day = '01'] = value.split('-');
	return `${year}-${month}-${day}`;
}

export function assertTravelDate(place) {
	const { date } = place;
	if (!date || !isTravelDate(date.start)) {
		throw new Error(`${place.city} 缺少有效的 date.start`);
	}
	if (date.end && !isTravelDate(date.end)) {
		throw new Error(`${place.city} 的 date.end 无效: ${date.end}`);
	}
	if (
		date.end
		&& comparePoints(
			date.end,
			date.endSequence ?? date.sequence,
			date.start,
			date.sequence,
		) < 0
	) {
		throw new Error(`${place.city} 的结束时间早于开始时间`);
	}
	for (const field of ['sequence', 'endSequence']) {
		if (date[field] != null && (!Number.isInteger(date[field]) || date[field] < 0)) {
			throw new Error(`${place.city} 的 date.${field} 必须是非负整数`);
		}
	}
	return date;
}

function comparePoints(leftValue, leftSequence, rightValue, rightSequence) {
	return normalizedDate(leftValue).localeCompare(normalizedDate(rightValue))
		|| (leftSequence || 0) - (rightSequence || 0);
}

export function compareTravelDates(left, right) {
	const leftDate = assertTravelDate(left);
	const rightDate = assertTravelDate(right);
	return comparePoints(
		leftDate.start,
		leftDate.sequence,
		rightDate.start,
		rightDate.sequence,
	);
}

export function sortByTravelDate(places) {
	return places
		.map((place, sourceIndex) => ({ place, sourceIndex }))
		.sort((left, right) =>
			compareTravelDates(left.place, right.place) || left.sourceIndex - right.sourceIndex)
		.map(({ place }) => place);
}

export function formatTravelDate(place) {
	const date = assertTravelDate(place);
	if (date.label) return date.label;
	return date.end ? `${date.start} — ${date.end}` : date.start;
}

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
	if (
		(node.kind === 'stay' || (node.kind === 'phase' && date.end != null))
		&& comparePoints(date.end, date.endSequence, date.start, date.sequence) <= 0
	) {
		throw new Error(`${node.city} 的持续驻留必须满足 start < end`);
	}
	return date;
}

function assertChildInside(parent, child) {
	const parentDate = parent.date;
	const childDate = child.date;
	const startsInside = comparePoints(
		childDate.start,
		childDate.sequence,
		parentDate.start,
		parentDate.sequence,
	) >= 0;
	const endsInside = parentDate.end == null || (
		child.kind === 'visit'
			? comparePoints(
				childDate.start,
				childDate.sequence,
				parentDate.end,
				parentDate.endSequence,
			) < 0
			: comparePoints(
				childDate.end,
				childDate.endSequence,
				parentDate.end,
				parentDate.endSequence,
			) <= 0
	);
	if (!startsInside || !endsInside) {
		throw new Error(`${child.city} 的时间不在父级 ${parent.city} 内`);
	}
}

function assertNode(node, parent) {
	if (!NODE_KINDS.has(node.kind)) {
		throw new Error(`${node.city} 的 kind 无效`);
	}
	if (parent && node.kind === 'phase') {
		throw new Error(`${node.city} 的主基地阶段不能嵌套在 ${parent.city} 内`);
	}
	if (Object.hasOwn(node, 'journeyId')) {
		if (node.kind !== 'visit') {
			throw new Error(`${node.city} 的 journeyId 只能用于 visit`);
		}
		if (typeof node.journeyId !== 'string' || !node.journeyId.trim()) {
			throw new Error(`${node.city} 的 journeyId 必须是非空字符串`);
		}
	}
	assertClosedDate(node);
	if (parent) assertChildInside(parent, node);

	const children = node.children || [];
	if (!Array.isArray(children)) {
		throw new Error(`${node.city} 的 children 必须是数组`);
	}
	if (node.kind === 'visit' && children.length) {
		throw new Error(`${node.city} 的短暂访问不能包含子地点`);
	}

	const stays = sortByTravelDate(children.filter(child => child.kind === 'stay'));
	for (let index = 1; index < stays.length; index += 1) {
		const previous = stays[index - 1].date;
		const current = stays[index].date;
		if (comparePoints(
			previous.end,
			previous.endSequence,
			current.start,
			current.sequence,
		) > 0) {
			throw new Error(`${stays[index - 1].city} 与 ${stays[index].city} 的持续驻留重叠`);
		}
	}
	children.forEach(child => assertNode(child, node));
}

export function assertTravelTree(phases) {
	if (!Array.isArray(phases) || phases.length === 0) {
		throw new Error('旅行数据至少需要一个主基地阶段');
	}

	const ordered = sortByTravelDate(phases);
	ordered.forEach((phase, index) => {
		if (phase.kind !== 'phase') {
			throw new Error(`${phase.city} 不是主基地阶段`);
		}
		assertNode(phase);
		if (index < ordered.length - 1 && phase.date.end == null) {
			throw new Error(`${phase.city} 不是最后阶段但缺少 date.end`);
		}
		if (index === ordered.length - 1 && phase.date.end !== null) {
			throw new Error(`${phase.city} 是当前阶段但 date.end 不是 null`);
		}
		if (index > 0) {
			const previous = ordered[index - 1];
			if (comparePoints(
				previous.date.end,
				previous.date.endSequence,
				phase.date.start,
				phase.date.sequence,
			) !== 0) {
				throw new Error(`主基地阶段不连续: ${previous.city} → ${phase.city}`);
			}
		}
	});
	return phases;
}
