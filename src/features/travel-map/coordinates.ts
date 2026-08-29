import { addCoordinatesFromGeoJson, normalizeCity, walkPlaces } from './geo';
import type { Coordinates, GeoJsonCollection, TravelPlace } from './types';

export function createCoordinateIndex() {
	const coordinates = new Map<string, Coordinates>();

	function get(place: TravelPlace): Coordinates {
		if (place.coordinates) return place.coordinates;
		const key = normalizeCity(place.city);
		const coordinate = coordinates.get(key);
		if (!coordinate) throw new Error(`未找到城市坐标: ${place.city} (${key})`);
		return coordinate;
	}

	function injectInto(places: TravelPlace[]) {
		const missing: string[] = [];
		walkPlaces(places, (place) => {
			try {
				Object.assign(place, get(place));
			} catch (error) {
				missing.push(error instanceof Error ? error.message : String(error));
			}
		});
		if (missing.length) throw new Error([...new Set(missing)].join('\n'));
	}

	return {
		addGeoJson: (geoJson: GeoJsonCollection) => addCoordinatesFromGeoJson(geoJson, coordinates),
		get,
		injectInto,
	};
}
