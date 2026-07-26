import {
	assertTravelTree,
	formatTravelDate,
	sortByTravelDate,
} from './travel-time.js';

function eventStop(place, fallbackAction) {
	return {
		city: place.city,
		province: place.province,
		date: { ...place.date },
		dateLabel: formatTravelDate(place),
		action: place.note || place.summary || fallbackAction,
		kind: place.kind,
		derived: false,
		...(place.coordinates ? { coordinates: { ...place.coordinates } } : {}),
	};
}

function returnStop(base, source) {
	const point = {
		start: source.date.end,
		end: source.date.end,
		label: source.date.label || source.date.end.replaceAll('-', '.'),
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
	for (let index = 0; index < children.length; index += 1) {
		const child = children[index];
		if (child.kind === 'visit') {
			if (child.journeyId) {
				const itinerary = [child];
				while (
					children[index + 1]?.kind === 'visit'
					&& children[index + 1].journeyId === child.journeyId
				) {
					itinerary.push(children[index + 1]);
					index += 1;
				}
				itinerary.forEach(place => stops.push(eventStop(place, '旅行')));
				stops.push(returnStop(container, itinerary.at(-1)));
				continue;
			}
			stops.push(eventStop(child, '旅行'));
			stops.push(returnStop(container, child));
			continue;
		}

		appendContainer(stops, child);
		const isTerminalStay = index === children.length - 1
			&& child.date.end === container.date.end
			&& (child.date.endSequence || 0) === (container.date.endSequence || 0);
		if (!isTerminalStay) {
			stops.push(returnStop(container, child));
		}
	}
}

export function buildJourneyStops(phases) {
	assertTravelTree(phases);
	const stops = [];
	sortByTravelDate(phases).forEach(phase => appendContainer(stops, phase));
	return stops;
}
