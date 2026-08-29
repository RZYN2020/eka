import type { Coordinates, GeoJsonCollection, TravelPlace } from './types';

const ETHNIC_NAMES =
	/傣族|白族|藏族|回族|壮族|维吾尔|蒙古族|朝鲜族|土家族|苗族|彝族|侗族|瑶族|布依族|哈尼族/g;

export function normalizeCity(name?: string) {
	return (name || '')
		.replace(/市|自治州|地区|盟|特别行政区/g, '')
		.replace(ETHNIC_NAMES, '')
		.trim();
}

export function normalizeProvince(name?: string) {
	return (name || '')
		.replace(/省|市|自治区|特别行政区/g, '')
		.replace(ETHNIC_NAMES, '')
		.trim();
}

export function childrenOf(place: TravelPlace): TravelPlace[] {
	return place.children || [];
}

export function walkPlaces(places: TravelPlace[], visit: (place: TravelPlace) => void) {
	for (const place of places) {
		visit(place);
		walkPlaces(childrenOf(place), visit);
	}
}

export function collectVisitedNames(bases: TravelPlace[]) {
	const cities = new Set();
	const provinces = new Set();
	walkPlaces(bases, (place) => {
		cities.add(normalizeCity(place.city));
		provinces.add(normalizeProvince(place.province));
	});
	return { cities, provinces };
}

export function addCoordinatesFromGeoJson(geoJson: GeoJsonCollection, coordinates: Map<string, Coordinates>) {
	for (const feature of geoJson.features) {
		const center = feature.properties.center;
		if (!center) continue;
		const name = normalizeCity(feature.properties.name);
		if (name && !coordinates.has(name)) {
			coordinates.set(name, { lat: center[1], lng: center[0] });
		}
	}
}

export function coordinateKey(lat: number, lng: number) {
	return `${lat}|${lng}`;
}
