const STORAGE_KEY = 'mv';

function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

export function readMapView(storage = globalThis.sessionStorage) {
	try {
		const value = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
		if (
			!value
			|| !isFiniteNumber(value.lat)
			|| !isFiniteNumber(value.lng)
			|| !isFiniteNumber(value.zoom)
		) {
			return null;
		}
		return { lat: value.lat, lng: value.lng, zoom: value.zoom };
	} catch {
		return null;
	}
}

export function writeMapView(storage = globalThis.sessionStorage, view) {
	try {
		storage.setItem(STORAGE_KEY, JSON.stringify(view));
		return true;
	} catch {
		return false;
	}
}
