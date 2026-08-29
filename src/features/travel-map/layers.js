import L from 'leaflet';
import { formatTravelDate } from '../../lib/travel-time.js';
import { childrenOf, collectVisitedNames, normalizeCity, normalizeProvince, walkPlaces } from './geo';
import { mapTransitionOptions, prefersReducedMotion } from './motion';

const GEO_CITY = '/geojson/china-cities.json';
const GEO_PROVINCE = '/geojson/china.json';
const GEO_WORLD = '/geojson/world.json';

const visitedCountries = new Set([
	'China',
	'中国',
	"People's Republic of China",
	'Hong Kong',
	'Hong Kong S.A.R.',
	'Macau',
	'Macau S.A.R.',
	'澳门',
	'香港',
]);

export function createLayerController({ bases, coordinates, getMap, tone }) {
	const visited = collectVisitedNames(bases);
	/** @type {Promise<void> | null} */
	let provinceRequest = null;
	/** @type {Promise<void> | null} */
	let worldRequest = null;
	const state = {
		city: null,
		province: null,
		world: null,
		view: 'china',
		highlight: 'city',
	};

	const isVisitedCity = (name) => visited.cities.has(normalizeCity(name));
	const isVisitedProvince = (name) => visited.provinces.has(normalizeProvince(name));
	const isVisitedCountry = (feature) =>
		[feature.properties.name, feature.properties.NAME, feature.properties.admin, feature.properties.name_long]
			.filter(Boolean)
			.some((name) => visitedCountries.has(name));

	function cityStyle(feature) {
		const active = isVisitedCity(feature.properties.name);
		return {
			fillColor: active ? tone('--map-visited-fill', '#68788a') : 'transparent',
			fillOpacity: active ? 0.18 : 0,
			color: active ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
			weight: active ? 1.2 : 0.45,
			opacity: active ? 0.9 : 0.55,
			className: active ? 'pv' : '',
			interactive: active,
		};
	}

	function bindCity(feature, layer) {
		const name = feature.properties.name;
		if (!isVisitedCity(name)) return;
		const normalized = normalizeCity(name);
		const visits = [];
		for (const base of bases) {
			if (normalizeCity(base.city) === normalized) {
				visits.push({ period: formatTravelDate(base), type: '驻地', color: base.color });
			}
			walkPlaces(childrenOf(base), (place) => {
				if (normalizeCity(place.city) === normalized) {
					visits.push({
						period: formatTravelDate(place),
						type: place.kind === 'stay' ? '驻留' : '旅行',
						color: base.color,
					});
				}
			});
		}
		const columns = visits.length > 6 ? ' cols' : '';
		const items = visits
			.map(
				(visit) =>
					`<div class="pu-item"><div class="pu-meta" style="margin-top:2px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${visit.color};margin-right:4px;vertical-align:middle;"></span>${visit.type} · ${visit.period}</div></div>`,
			)
			.join('');
		layer.bindPopup(
			`<span class="pu-city">${name.replace(/市|自治州|地区|盟|特别行政区|傣族|白族|藏族|回族|壮族|维吾尔|蒙古族自治州/g, '')}</span>${visits.length > 3 ? `<div class="pu-list${columns}" style="margin-top:3px;">${items}</div>` : items}`,
		);
		layer.on({
			mouseover(event) {
				event.target.setStyle({ color: '#f59e0b', weight: 3.5, opacity: 1 });
				if (!L.Browser.ie) event.target.bringToFront();
			},
			mouseout(event) {
				state.city?.resetStyle(event.target);
			},
		});
	}

	function provinceStyle(feature) {
		const name = feature.properties.name;
		if (name === '十段线' || name === '南海诸岛') {
			return {
				fillColor: 'transparent',
				fillOpacity: 0,
				color: tone('--map-boundary', '#aaa7a0'),
				weight: 0.4,
				dashArray: '3 5',
				interactive: false,
			};
		}
		const active = isVisitedProvince(name);
		return {
			fillColor: active ? tone('--map-visited-fill', '#68788a') : 'transparent',
			fillOpacity: active ? 0.16 : 0,
			color: active ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
			weight: active ? 1.2 : 0.5,
			opacity: active ? 0.9 : 0.55,
			interactive: active,
		};
	}

	function bindProvince(feature, layer) {
		const name = feature.properties.name;
		if (name === '十段线' || name === '南海诸岛' || !isVisitedProvince(name)) return;
		const normalized = normalizeProvince(name);
		const cities = new Set();
		walkPlaces(bases, (place) => {
			if (normalizeProvince(place.province) === normalized) cities.add(place.city);
		});
		layer.bindPopup(
			`<span class="pu-city">${name}</span>${cities.size ? `<div style="margin-top:3px;font-size:0.74rem;color:#6b6356;">${[...cities].map((city) => `📍 ${city}<br>`).join('')}</div>` : ''}`,
		);
		layer.on({
			mouseover(event) {
				event.target.setStyle({ color: '#f59e0b', weight: 3.5, opacity: 1 });
				if (!L.Browser.ie) event.target.bringToFront();
			},
			mouseout(event) {
				state.province?.resetStyle(event.target);
			},
		});
	}

	function worldStyle(feature) {
		const active = isVisitedCountry(feature);
		return {
			fillColor: active ? tone('--map-visited-fill', '#68788a') : 'transparent',
			fillOpacity: active ? 0.16 : 0,
			color: active ? tone('--map-visited-line', '#536170') : tone('--map-boundary', '#aaa7a0'),
			weight: active ? 1.1 : 0.4,
			opacity: active ? 0.9 : 0.5,
			interactive: active,
		};
	}

	function bindWorld(feature, layer) {
		if (!isVisitedCountry(feature)) return;
		const name = feature.properties.name || feature.properties.NAME || feature.properties.admin || '';
		layer.bindPopup(`<span class="pu-city">${name}</span>`);
		layer.on({
			mouseover(event) {
				event.target.setStyle({ color: '#f59e0b', weight: 3, opacity: 1 });
				if (!L.Browser.ie) event.target.bringToFront();
			},
			mouseout(event) {
				event.target.setStyle(worldStyle(feature));
			},
		});
	}

	async function fetchGeoJson(path, label) {
		const response = await fetch(path);
		if (!response.ok) throw new Error(`Unable to load ${label} GeoJSON`);
		return response.json();
	}

	async function loadCity() {
		const data = await fetchGeoJson(GEO_CITY, 'city');
		coordinates.addGeoJson(data);
		state.city = L.geoJSON(data, { style: cityStyle, onEachFeature: bindCity, pane: 'overlayPane' }).addTo(
			getMap(),
		);
	}

	async function loadProvince() {
		const data = await fetchGeoJson(GEO_PROVINCE, 'province');
		coordinates.addGeoJson(data);
		state.province = L.geoJSON(data, {
			style: provinceStyle,
			onEachFeature: bindProvince,
			pane: 'overlayPane',
		}).addTo(getMap());
		getMap().removeLayer(state.province);
	}

	async function loadWorld() {
		const data = await fetchGeoJson(GEO_WORLD, 'world');
		state.world = L.geoJSON(data, { style: worldStyle, onEachFeature: bindWorld, pane: 'overlayPane' }).addTo(
			getMap(),
		);
		getMap().removeLayer(state.world);
	}

	async function ensureProvince() {
		if (state.province) return;
		provinceRequest ??= loadProvince().catch((error) => {
			provinceRequest = null;
			throw error;
		});
		await provinceRequest;
	}

	async function ensureWorld() {
		if (state.world) return;
		worldRequest ??= loadWorld().catch((error) => {
			worldRequest = null;
			throw error;
		});
		await worldRequest;
	}

	function applyHighlight() {
		for (const layer of [state.city, state.province, state.world]) {
			if (layer) getMap().removeLayer(layer);
		}
		const active =
			state.highlight === 'city' ? state.city : state.highlight === 'province' ? state.province : state.world;
		if (active) getMap().addLayer(active);
	}

	function setBusy(busy) {
		document.querySelectorAll('.map-ctrl-btn[data-view], .map-ctrl-btn[data-mode]').forEach((button) => {
			button.disabled = busy;
		});
		document.getElementById('map').setAttribute('aria-busy', String(busy));
		document.getElementById('loaderCover').classList.toggle('off', !busy);
	}

	async function withBusy(action) {
		setBusy(true);
		try {
			await action();
			return true;
		} catch (error) {
			console.error(error);
			return false;
		} finally {
			setBusy(false);
		}
	}

	async function switchView(view) {
		if (view === state.view) return;
		const loaded = await withBusy(async () => {
			if (view === 'world') await ensureWorld();
			else if (state.highlight === 'province') await ensureProvince();
		});
		if (!loaded) return;
		state.view = view;
		if (view === 'world') state.highlight = 'country';
		else if (state.highlight === 'country') state.highlight = 'city';
		document.querySelectorAll('.map-ctrl-btn[data-view]').forEach((button) => {
			const active = button.dataset.view === view;
			button.classList.toggle('active', active);
			button.setAttribute('aria-pressed', String(active));
		});
		document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach((button) => {
			const active = button.dataset.mode === state.highlight;
			button.classList.toggle('active', active);
			button.setAttribute('aria-pressed', String(active));
		});
		document.getElementById('modeControls').hidden = view === 'world';
		const center = view === 'china' ? [34, 108] : [20, 0];
		const zoom = view === 'china' ? 5 : 2;
		if (prefersReducedMotion()) getMap().setView(center, zoom, { animate: false });
		else getMap().flyTo(center, zoom, mapTransitionOptions(0.7));
		applyHighlight();
		updateStyles();
	}

	async function switchHighlight(highlight) {
		if (highlight === state.highlight) return;
		const loaded = await withBusy(async () => {
			if (highlight === 'province') await ensureProvince();
		});
		if (!loaded) return;
		state.highlight = highlight;
		document.querySelectorAll('.map-ctrl-btn[data-mode]').forEach((button) => {
			const active = button.dataset.mode === highlight;
			button.classList.toggle('active', active);
			button.setAttribute('aria-pressed', String(active));
		});
		applyHighlight();
	}

	function updateStyles() {
		state.city?.eachLayer((layer) => layer.feature && layer.setStyle?.(cityStyle(layer.feature)));
		state.province?.eachLayer((layer) => layer.feature && layer.setStyle?.(provinceStyle(layer.feature)));
		state.world?.eachLayer((layer) => layer.feature && layer.setStyle?.(worldStyle(layer.feature)));
	}

	return {
		applyHighlight,
		currentView: () => state.view,
		loadInitial: loadCity,
		switchHighlight,
		switchView,
		updateStyles,
	};
}
