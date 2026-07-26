import assert from 'node:assert/strict';
import {
	readMapView,
	writeMapView,
} from '../src/lib/map-storage.js';

function memoryStorage(initialValue = null) {
	let value = initialValue;
	return {
		getItem: () => value,
		setItem: (_key, nextValue) => {
			value = nextValue;
		},
		value: () => value,
	};
}

assert.equal(readMapView(memoryStorage()), null);
assert.equal(readMapView(memoryStorage('{broken json')), null);
assert.equal(
	readMapView(memoryStorage(JSON.stringify({ lat: '31.2', lng: 121.5, zoom: 8 }))),
	null,
);
assert.deepEqual(
	readMapView(memoryStorage(JSON.stringify({ lat: 31.2, lng: 121.5, zoom: 8 }))),
	{ lat: 31.2, lng: 121.5, zoom: 8 },
);
assert.equal(
	readMapView({ getItem: () => { throw new Error('storage blocked'); } }),
	null,
);

const writable = memoryStorage();
assert.equal(writeMapView(writable, { lat: 31.2, lng: 121.5, zoom: 8 }), true);
assert.deepEqual(JSON.parse(writable.value()), { lat: 31.2, lng: 121.5, zoom: 8 });
assert.equal(
	writeMapView({ setItem: () => { throw new Error('quota exceeded'); } }, { lat: 1, lng: 2, zoom: 3 }),
	false,
);

console.log('Map view storage safely handles unavailable and malformed session storage.');
