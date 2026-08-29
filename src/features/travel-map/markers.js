import L from 'leaflet';
import { compareTravelDates, formatTravelDate } from '../../lib/travel-time.js';
import { articleLink } from './content-links';
import { baseIcon, stayIcon, tripIcon } from './marker-icons';
import { childrenOf, coordinateKey } from './geo';

export function createMarkerController({ bases, getMap }) {
	let entries = [];
	let byKey = new Map();

	function buildContexts() {
		const locations = new Map();
		const add = (place, context, color, baseIndex) => {
			const key = coordinateKey(place.lat, place.lng);
			if (!locations.has(key))
				locations.set(key, { contexts: [], bestColor: color, bestBaseIndex: baseIndex });
			const location = locations.get(key);
			const latest = location.contexts.reduce(
				(candidate, current) =>
					!candidate || compareTravelDates(current.data, candidate.data) > 0 ? current : candidate,
				null,
			);
			location.contexts.push(context);
			if (!latest || compareTravelDates(place, latest.data) > 0) {
				location.bestColor = color;
				location.bestBaseIndex = baseIndex;
			}
		};

		bases.forEach((base, baseIndex) => {
			add(
				base,
				{ type: 'phase', bi: baseIndex, data: base, period: formatTravelDate(base) },
				base.color,
				baseIndex,
			);
			childrenOf(base).forEach((trip, tripIndex) => {
				add(
					trip,
					{ type: trip.kind, bi: baseIndex, ti: tripIndex, data: trip, period: formatTravelDate(trip) },
					base.color,
					baseIndex,
				);
				childrenOf(trip).forEach((nested, nestedIndex) => {
					add(
						nested,
						{
							type: 'nested-visit',
							bi: baseIndex,
							ti: tripIndex,
							si: nestedIndex,
							data: nested,
							period: `${formatTravelDate(nested)} (${trip.city})`,
						},
						base.color,
						baseIndex,
					);
				});
			});
		});
		return locations;
	}

	function popupMarkup(location) {
		const columns = location.contexts.length > 6 ? ' cols' : '';
		const items = location.contexts
			.map((context, index) => {
				const place = context.data;
				const tag =
					context.type === 'phase'
						? `<span class="pu-tag" style="background:${location.bestColor}">驻地</span>`
						: context.type === 'stay'
							? `<span class="pu-tag" style="background:${location.bestColor}">驻留</span>`
							: '';
				return `${index ? '<hr class="pu-sep">' : ''}<div class="pu-item">
				<div class="pu-city">${place.city}${tag}</div>
				<div class="pu-meta">${place.province} · ${context.period}</div>
				${place.note ? `<div class="pu-note">${place.note}</div>` : ''}
				${articleLink(place.slug)}
			</div>`;
			})
			.join('');
		return `<div class="pu-list${columns}">${items}</div>`;
	}

	function render() {
		const map = getMap();
		for (const entry of entries) map.removeLayer(entry.marker);
		entries = [];
		byKey = new Map();

		for (const [key, location] of buildContexts()) {
			const [lat, lng] = key.split('|').map(Number);
			const isBase = location.contexts.some((context) => context.type === 'phase');
			const isStay = !isBase && location.contexts.some((context) => context.type === 'stay');
			const marker = L.marker([lat, lng], {
				icon: isBase
					? baseIcon(location.bestColor)
					: isStay
						? stayIcon(location.bestColor)
						: tripIcon(location.bestColor),
				riseOnHover: true,
			});
			marker.bindPopup(popupMarkup(location));
			marker.addTo(map);
			const entry = { marker, key, lat, lng, color: location.bestColor, isBase, contexts: location.contexts };
			entries.push(entry);
			byKey.set(key, entry);
			marker._cm = entry;
		}
	}

	return {
		forEach: (callback) => entries.forEach(callback),
		get: (key) => byKey.get(key),
		render,
	};
}
