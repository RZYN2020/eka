import { walkPlaces } from './geo';
import { elementById, queryElement } from './dom';
import type { TravelPlace } from './types';

export function renderTravelStats(bases: TravelPlace[]) {
	const places: TravelPlace[] = [];
	walkPlaces(bases, (place) => places.push(place));
	const stays = places.filter((place) => place.kind === 'stay');
	const cities = new Set(places.map((place) => `${place.city}|${place.province}`));
	const provinces = new Set(places.map((place) => place.province));
	const totalBases = bases.length + stays.length;
	const totalProvinces = 34;
	const percent = Math.round((provinces.size / totalProvinces) * 100);

	elementById('statsSummary').textContent =
		`${totalBases} 个驻地 · ${cities.size} 座城市 · ${provinces.size}/${totalProvinces} 个省级行政区`;
	queryElement<HTMLElement>('#statsBar .stats-row').innerHTML =
		`<span>驻地 <strong>${totalBases}</strong></span><span>城市 <strong>${cities.size}</strong></span><span>省份 <strong>${provinces.size}/${totalProvinces}</strong></span>`;
	elementById('provBar').style.width = `${percent}%`;
	elementById('legend').innerHTML = bases
		.map(
			(base) =>
				`<div class="legend-item"><div class="legend-swatch" style="background:${base.color}"></div>${base.city} · ${base.summary}</div>`,
		)
		.join('');
}
