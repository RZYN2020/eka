import L from 'leaflet';
import { bases } from '../../data/travel.js';
import { buildJourneyStops } from '../../lib/travel-journey.js';
import { createJourneyView } from './journey-view.js';
import { prefersReducedMotion } from './motion';

export function createJourneyController({ getMap, getCoords, clearSelection, ensureChinaView, tone }) {
	const state = {
		active: false,
		playing: false,
		moving: false,
		index: -1,
		token: 0,
		frame: 0,
		timer: 0,
		line: null,
		person: null,
		stops: [],
		completed: [],
	};

	function icon() {
		return L.divIcon({
			className: '',
			iconSize: [36, 36],
			iconAnchor: [18, 18],
			html: '<span class="journey-avatar" aria-hidden="true"></span>',
		});
	}

	function timelinePosition(index) {
		if (state.stops.length <= 1) return 0;
		return (index / (state.stops.length - 1)) * 100;
	}

	function destinations() {
		return state.stops.map((stop, index) => ({ stop, index })).filter(({ stop }) => !stop.derived);
	}

	function currentLabel() {
		const stop = state.stops[Math.max(0, state.index)];
		return stop ? `${stop.dateLabel} · ${stop.city}` : '';
	}

	const { renderTimeline, resetButton, updateControls, updateStatus } = createJourneyView({
		state,
		timelinePosition,
		currentLabel,
		seek,
	});

	function seek(index) {
		const stop = state.stops[index];
		if (!stop) return;
		const map = getMap();

		state.token += 1;
		clearTimeout(state.timer);
		state.active = true;
		state.playing = false;
		state.moving = false;
		state.index = index;
		state.completed = state.stops.slice(0, index + 1).map((item) => [item.lat, item.lng]);

		const button = document.getElementById('btnJourney');
		button.textContent = '退出轨迹';
		button.setAttribute('aria-pressed', 'true');
		if (!state.person) {
			state.person = L.marker([stop.lat, stop.lng], {
				icon: icon(),
				interactive: false,
				zIndexOffset: 2000,
			}).addTo(map);
		} else {
			state.person.setLatLng([stop.lat, stop.lng]);
		}
		state.line.setLatLngs(state.completed);
		map.stop();
		map.setView([stop.lat, stop.lng], stop.kind === 'phase' ? 6 : 7, { animate: false });
		updateStatus(stop);
		updateControls();
	}

	function seekAdjacent(direction) {
		const choices = destinations();
		const target =
			direction < 0
				? choices.filter(({ index }) => index < state.index).at(-1) || choices[0]
				: choices.find(({ index }) => index > state.index) || choices.at(-1);
		if (!target) return false;
		seek(target.index);
		return true;
	}

	function seekBoundary(edge) {
		const choices = destinations();
		const target = edge === 'end' ? choices.at(-1) : choices[0];
		if (!target) return false;
		seek(target.index);
		return true;
	}

	function seekFromPointer(event) {
		const track = document.getElementById('journeyTimeTrack');
		const rect = track.getBoundingClientRect();
		const progress = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		const target = destinations().reduce((nearest, candidate) => {
			const distance = Math.abs(timelinePosition(candidate.index) / 100 - progress);
			return !nearest || distance < nearest.distance ? { ...candidate, distance } : nearest;
		}, null);
		if (target) seek(target.index);
	}

	function stop() {
		state.token += 1;
		state.active = false;
		state.playing = false;
		state.moving = false;
		state.index = -1;
		clearTimeout(state.timer);
		cancelAnimationFrame(state.frame);
		state.frame = 0;
		const map = getMap();
		if (map) {
			if (state.line) map.removeLayer(state.line);
			if (state.person) map.removeLayer(state.person);
		}
		state.line = null;
		state.person = null;
		state.stops = [];
		state.completed = [];
		document.getElementById('journeyStatus').hidden = true;
		document.getElementById('journeyTimeline').hidden = true;
		resetButton();
	}

	function animateSegment(from, to, completed, duration, token) {
		return new Promise((resolve) => {
			const startedAt = performance.now();
			const step = (now) => {
				if (token !== state.token) return resolve(false);
				const progress = Math.min((now - startedAt) / duration, 1);
				const eased = 0.5 - Math.cos(Math.PI * progress) / 2;
				const current = [from.lat + (to.lat - from.lat) * eased, from.lng + (to.lng - from.lng) * eased];
				state.person.setLatLng(current);
				state.line.setLatLngs([...completed, current]);
				if (progress < 1) state.frame = requestAnimationFrame(step);
				else resolve(true);
			};
			state.frame = requestAnimationFrame(step);
		});
	}

	function scheduleStep() {
		clearTimeout(state.timer);
		if (!state.playing || state.index >= state.stops.length - 1) return;
		state.timer = window.setTimeout(advance, 950);
	}

	function focusSegment(from, to, token) {
		return new Promise((resolve) => {
			if (token !== state.token) return resolve(false);
			const map = getMap();
			const samePlace = from.lat === to.lat && from.lng === to.lng;
			const reducedMotion = prefersReducedMotion();
			let settled = false;
			const finish = () => {
				if (settled) return;
				settled = true;
				map.off('moveend', finish);
				resolve(token === state.token);
			};
			map.stop();
			map.once('moveend', finish);
			if (samePlace) {
				map.flyTo([to.lat, to.lng], Math.max(map.getZoom(), 8), {
					animate: !reducedMotion,
					duration: reducedMotion ? 0 : 0.45,
				});
			} else {
				map.flyToBounds(
					[
						[from.lat, from.lng],
						[to.lat, to.lng],
					],
					{
						paddingTopLeft: [72, 92],
						paddingBottomRight: [72, 92],
						maxZoom: 8,
						animate: !reducedMotion,
						duration: reducedMotion ? 0 : 0.55,
					},
				);
			}
			window.setTimeout(finish, reducedMotion ? 80 : 900);
		});
	}

	async function advance() {
		if (!state.active || state.moving || state.index >= state.stops.length - 1) return;
		clearTimeout(state.timer);
		const token = state.token;
		const nextIndex = state.index + 1;
		const next = state.stops[nextIndex];
		const previous = state.index >= 0 ? state.stops[state.index] : next;
		const reducedMotion = prefersReducedMotion();
		const map = getMap();

		state.moving = true;
		updateControls();
		if (!state.person) {
			await focusSegment(next, next, token);
			if (token !== state.token) return;
			state.person = L.marker([next.lat, next.lng], {
				icon: icon(),
				interactive: false,
				zIndexOffset: 2000,
			}).addTo(map);
			state.completed = [[next.lat, next.lng]];
			state.line.setLatLngs(state.completed);
		} else {
			const focused = await focusSegment(previous, next, token);
			if (!focused) return;
			if (reducedMotion) {
				state.person.setLatLng([next.lat, next.lng]);
				state.line.setLatLngs([...state.completed, [next.lat, next.lng]]);
			} else {
				const completed = await animateSegment(previous, next, state.completed, 720, token);
				if (!completed) return;
			}
			state.completed.push([next.lat, next.lng]);
		}

		state.index = nextIndex;
		state.moving = false;
		updateStatus(next);
		updateControls();
		if (state.index >= state.stops.length - 1) {
			state.playing = false;
			state.active = false;
			resetButton('重播轨迹');
			updateControls();
			return;
		}
		scheduleStep();
	}

	function togglePlayback() {
		if (!state.active) return;
		if (state.index >= state.stops.length - 1) {
			start();
			return;
		}
		state.playing = !state.playing;
		clearTimeout(state.timer);
		updateControls();
		if (state.playing) scheduleStep();
	}

	function start() {
		stop();
		const map = getMap();
		const button = document.getElementById('btnJourney');
		const reducedMotion = prefersReducedMotion();
		state.active = true;
		state.playing = true;
		state.stops = buildJourneyStops(bases).map((stop) => ({ ...stop, ...getCoords(stop) }));
		renderTimeline();
		button.textContent = '退出轨迹';
		button.setAttribute('aria-pressed', 'true');
		clearSelection();
		map.closePopup();
		ensureChinaView();
		map.fitBounds(
			state.stops.map((stop) => [stop.lat, stop.lng]),
			{
				padding: [64, 64],
				maxZoom: 5,
				animate: !reducedMotion,
			},
		);
		state.line = L.polyline([], {
			color: tone('--journey-line', '#536b85'),
			weight: 2,
			opacity: 0.88,
		}).addTo(map);
		updateControls();
		advance();
	}

	function updateTheme() {
		state.line?.setStyle({ color: tone('--journey-line', '#536b85') });
	}

	return {
		state,
		start,
		stop,
		advance,
		seek,
		togglePlayback,
		seekAdjacent,
		seekBoundary,
		seekFromPointer,
		updateTheme,
	};
}
