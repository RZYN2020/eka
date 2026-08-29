import L from 'leaflet';
import { bases } from '../data/travel.js';
import { createCoordinateIndex } from '../features/travel-map/coordinates';
import { elementById, queryElement } from '../features/travel-map/dom';
import { createLayerController } from '../features/travel-map/layers.js';
import { createMarkerController } from '../features/travel-map/markers.js';
import { mapTransitionOptions, prefersReducedMotion, scrollBehavior } from '../features/travel-map/motion';
import { renderTravelStats } from '../features/travel-map/stats';
import { createTimelineController } from '../features/travel-map/timeline.js';
import { readMapView, writeMapView } from '../lib/map-storage.js';
import { createJourneyController } from '../features/travel-map/journey-controller.js';
import { assertTravelTree } from '../lib/travel-time.js';
import type { MarkerEntry, TravelPlace } from '../features/travel-map/types';

let map: L.Map;
let resizeObserver: ResizeObserver | undefined;
let resizeFrame = 0;
const timelineRef: { current?: ReturnType<typeof createTimelineController> } = {};

const travelBases = bases as TravelPlace[];
const coordinates = createCoordinateIndex();
const tone = (name: string, fallback: string) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const layers = createLayerController({
	bases: travelBases,
	coordinates,
	getMap: () => map,
	tone,
});

const journey = createJourneyController({
	getMap: () => map,
	getCoords: coordinates.get,
	clearSelection: () => timelineRef.current?.clearSelection(),
	ensureChinaView: () => {
		if (layers.currentView() !== 'china') void layers.switchView('china');
	},
	tone,
});

const markers = createMarkerController({ bases: travelBases, getMap: () => map });

function showBack(visible: boolean) {
	elementById('backWrap').classList.toggle('on', visible);
}

function flyTo(lat: number, lng: number, zoom = 11, callback?: () => void) {
	if (callback) map.once('moveend', callback);
	if (prefersReducedMotion()) map.setView([lat, lng], zoom, { animate: false });
	else map.flyTo([lat, lng], zoom, mapTransitionOptions(0.9));
}

const timeline = createTimelineController({
	bases: travelBases,
	getMarker: markers.get,
	forEachMarker: markers.forEach,
	stopJourney: journey.stop,
	flyTo,
	showBack,
});
timelineRef.current = timeline;

function goToOverview() {
	journey.stop();
	timeline.clearSelection();
	map.closePopup();
	const world = layers.currentView() === 'world';
	const center: L.LatLngTuple = world ? [20, 0] : [34, 108];
	const zoom = world ? 2 : 5;
	if (prefersReducedMotion()) map.setView(center, zoom, { animate: false });
	else map.flyTo(center, zoom, mapTransitionOptions(0.8));
}

function bindJourneyTimeline() {
	const track = elementById('journeyTimeTrack');
	let pointer: number | null = null;

	track.addEventListener('pointerdown', (event) => {
		if (!journey.state.stops.length || event.button !== 0) return;
		pointer = event.pointerId;
		track.setPointerCapture(event.pointerId);
		track.classList.add('is-scrubbing');
		journey.seekFromPointer(event);
		event.preventDefault();
	});
	track.addEventListener('pointermove', (event) => {
		if (event.pointerId === pointer) journey.seekFromPointer(event);
	});

	const finish = (event: PointerEvent, seek = true) => {
		if (event.pointerId !== pointer) return;
		if (seek) journey.seekFromPointer(event);
		pointer = null;
		track.classList.remove('is-scrubbing');
		if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
	};
	track.addEventListener('pointerup', finish);
	track.addEventListener('pointercancel', (event) => finish(event, false));
	track.addEventListener('keydown', (event) => {
		if (!journey.state.stops.length) return;
		if (event.key === 'ArrowLeft') journey.seekAdjacent(-1);
		else if (event.key === 'ArrowRight') journey.seekAdjacent(1);
		else if (event.key === 'Home') journey.seekBoundary('start');
		else if (event.key === 'End') journey.seekBoundary('end');
		else return;
		event.preventDefault();
	});
}

function isInteractiveShortcutTarget(target: EventTarget | null) {
	return (
		target instanceof Element &&
		Boolean(
			target.closest(
				'a, button, input, textarea, select, [contenteditable="true"], [role="slider"], .leaflet-container',
			),
		)
	);
}

function bindKeyboardShortcuts() {
	document.addEventListener('keydown', (event) => {
		if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
		if (isInteractiveShortcutTarget(event.target)) return;
		const key = event.key.toLowerCase();

		if (key === 'j') {
			if (!map || elementById<HTMLButtonElement>('btnJourney').disabled) return;
			event.preventDefault();
			if (journey.state.active) journey.stop();
			else journey.start();
			return;
		}
		if (event.key === 'Escape' && journey.state.stops.length) {
			event.preventDefault();
			journey.stop();
			return;
		}
		if (event.key === ' ' && journey.state.stops.length) {
			event.preventDefault();
			if (journey.state.active) journey.togglePlayback();
			else journey.start();
			return;
		}
		if (event.key === 'ArrowLeft' && journey.state.stops.length) {
			event.preventDefault();
			journey.seekAdjacent(-1);
			return;
		}
		if (event.key === 'ArrowRight' && journey.state.stops.length) {
			event.preventDefault();
			journey.seekAdjacent(1);
		}
	});
}

function bindMobileSidebar() {
	const button = elementById('btnMob');
	const sidebar = elementById('sidebarCol');
	button.addEventListener('click', () => {
		const open = sidebar.classList.toggle('open');
		document.body.classList.toggle('map-sidebar-open', open);
		button.setAttribute('aria-expanded', String(open));
		button.innerHTML = open
			? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>'
			: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>';
	});
}

function bindControls() {
	elementById('btnBack').addEventListener('click', () => {
		window.location.href = '/about/';
	});
	document.querySelectorAll<HTMLElement>('.map-ctrl-btn[data-view]').forEach((button) => {
		button.addEventListener('click', async () => {
			journey.stop();
			await layers.switchView(button.dataset.view);
		});
	});
	document.querySelectorAll<HTMLElement>('.map-ctrl-btn[data-mode]').forEach((button) => {
		button.addEventListener('click', async () => {
			journey.stop();
			await layers.switchHighlight(button.dataset.mode);
		});
	});
	elementById('btnGlobal').addEventListener('click', goToOverview);
	elementById('btnJourney').addEventListener('click', () => {
		if (journey.state.active) journey.stop();
		else journey.start();
	});
	elementById('btnJourneyPlay').addEventListener('click', () => {
		if (journey.state.active) journey.togglePlayback();
		else journey.start();
	});
	elementById('btnJourneyNext').addEventListener('click', journey.advance);
	elementById('btnBackTop').addEventListener('click', () => {
		queryElement('.sidebar-scroll').scrollTo({ top: 0, behavior: scrollBehavior() });
	});
	window.addEventListener('eka-theme-change', () => {
		layers.updateStyles();
		journey.updateTheme();
	});
	bindJourneyTimeline();
	bindKeyboardShortcuts();
	bindMobileSidebar();
}

function bindMapEvents() {
	map.on('popupopen', (event) => {
		const marker = (event.popup as L.Popup & { _source?: { _cm?: MarkerEntry } })._source?._cm;
		if (marker && !timeline.isSyncSuppressed()) timeline.syncFromMap(marker);
	});
	map.on('click', (event) => {
		const target = event.originalEvent.target;
		if (!(target instanceof Element)) return;
		if (target.classList.contains('leaflet-tile') || target.closest('.leaflet-tile-pane')) {
			journey.stop();
			timeline.clearSelection();
			map.closePopup();
		}
	});
}

async function initialize() {
	const saved = readMapView() ?? { lat: 34, lng: 108, zoom: 5 };
	map = L.map('map', {
		center: [saved.lat, saved.lng],
		zoom: saved.zoom,
		zoomControl: true,
		attributionControl: true,
	});

	resizeObserver = new ResizeObserver(() => {
		cancelAnimationFrame(resizeFrame);
		resizeFrame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
	});
	resizeObserver.observe(elementById('map'));

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OSM',
		maxZoom: 18,
	}).addTo(map);

	try {
		await layers.loadInitial();
		assertTravelTree(travelBases);
		coordinates.injectInto(travelBases);
		map.invalidateSize({ pan: false });
		layers.applyHighlight();
		markers.render();
		timeline.render();
		renderTravelStats(travelBases);
		elementById<HTMLButtonElement>('btnJourney').disabled = false;
		elementById('map').classList.add('on');
		bindMapEvents();
	} catch (error) {
		console.error(error);
		elementById('map').innerHTML =
			'<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#c44;">地图加载失败</div>';
	} finally {
		elementById('loaderCover').classList.add('off');
	}
}

window.addEventListener('beforeunload', () => {
	if (map) {
		const center = map.getCenter();
		writeMapView(undefined, { lat: center.lat, lng: center.lng, zoom: map.getZoom() });
	}
	journey.stop();
	resizeObserver?.disconnect();
	cancelAnimationFrame(resizeFrame);
});

bindControls();
void initialize();
