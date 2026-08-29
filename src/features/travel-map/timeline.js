import { formatTravelDate, sortByTravelDate } from '../../lib/travel-time.js';
import { articleLink } from './content-links';
import { childrenOf, coordinateKey } from './geo';
import { prefersReducedMotion, scrollBehavior } from './motion';

const toggleIcon =
	'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';

function activateWithKeyboard(element, handler) {
	element.tabIndex = 0;
	element.setAttribute('role', 'button');
	element.addEventListener('keydown', (event) => {
		if (event.target !== element || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		handler();
	});
}

function setTripsExpanded(id, expanded) {
	const trips = document.getElementById(id);
	if (!trips || trips.classList.contains('collapsed') === expanded) return;
	const toggle = document.querySelector(`.tl-toggle[data-target="${id}"]`);

	if (prefersReducedMotion()) {
		trips.classList.toggle('collapsed', !expanded);
		trips.style.maxHeight = '';
	} else if (expanded) {
		trips.classList.remove('collapsed');
		const height = trips.scrollHeight;
		trips.style.maxHeight = '0px';
		void trips.offsetHeight;
		trips.style.maxHeight = `${height}px`;
		trips.addEventListener(
			'transitionend',
			() => {
				trips.style.maxHeight = '';
			},
			{ once: true },
		);
	} else {
		trips.style.maxHeight = `${trips.scrollHeight}px`;
		void trips.offsetHeight;
		trips.classList.add('collapsed');
		requestAnimationFrame(() => {
			trips.style.maxHeight = '';
		});
	}

	toggle?.classList.toggle('flipped', !expanded);
}

export function createTimelineController({ bases, getMarker, forEachMarker, stopJourney, flyTo, showBack }) {
	const selection = { base: null, trip: null, suppressMapSync: false };

	function highlightMarker(key, highlighted) {
		getMarker(key)?.marker.setZIndexOffset(highlighted ? 1000 : 0);
	}

	function resetMarkers() {
		forEachMarker((marker) => marker.marker.setZIndexOffset(0));
	}

	function pulse(lat, lng, active) {
		const marker = getMarker(coordinateKey(lat, lng));
		marker?.marker._icon?.classList.toggle('is-pulsing', active);
	}

	function clearSelection() {
		document
			.querySelectorAll('.tl-base.sel,.tl-base-sub.sel,.tl-trip.sel')
			.forEach((element) => element.classList.remove('sel'));
		selection.base = null;
		selection.trip = null;
		resetMarkers();
		showBack(false);
	}

	function finishSelection(place, zoom) {
		highlightMarker(coordinateKey(place.lat, place.lng), true);
		selection.suppressMapSync = true;
		showBack(true);
		flyTo(place.lat, place.lng, zoom, () => {
			getMarker(coordinateKey(place.lat, place.lng))?.marker.openPopup();
			window.setTimeout(() => {
				selection.suppressMapSync = false;
			}, 200);
		});
	}

	function selectBase(baseIndex) {
		stopJourney();
		clearSelection();
		const base = bases[baseIndex];
		setTripsExpanded(`tps-${baseIndex}`, true);
		const card = document.getElementById(`b-${baseIndex}`);
		card?.classList.add('sel');
		card?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
		selection.base = baseIndex;
		finishSelection(base, 9);
	}

	function selectTrip(baseIndex, tripIndex) {
		stopJourney();
		clearSelection();
		const base = bases[baseIndex];
		const trip = childrenOf(base)[tripIndex];
		setTripsExpanded(`tps-${baseIndex}`, true);
		document.getElementById(`b-${baseIndex}`)?.classList.add('sel');
		const cardId = trip.kind === 'stay' ? `b-${baseIndex}-sub-${tripIndex}` : `t-${baseIndex}-${tripIndex}`;
		const card = document.getElementById(cardId);
		card?.classList.add('sel');
		card?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
		selection.base = baseIndex;
		selection.trip = `${baseIndex}-${tripIndex}`;
		finishSelection(trip, 11);
	}

	function selectNestedTrip(baseIndex, tripIndex, nestedIndex) {
		stopJourney();
		clearSelection();
		const trip = childrenOf(bases[baseIndex])[tripIndex];
		const nested = childrenOf(trip)[nestedIndex];
		setTripsExpanded(`tps-${baseIndex}`, true);
		setTripsExpanded(`tps-sub-${baseIndex}-${tripIndex}`, true);
		document.getElementById(`b-${baseIndex}`)?.classList.add('sel');
		document.getElementById(`b-${baseIndex}-sub-${tripIndex}`)?.classList.add('sel');
		const card = document.getElementById(`t-${baseIndex}-${tripIndex}-sub-${nestedIndex}`);
		card?.classList.add('sel');
		card?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
		selection.base = baseIndex;
		selection.trip = `${baseIndex}-${tripIndex}-sub-${nestedIndex}`;
		finishSelection(nested, 12);
	}

	function renderNestedTrips(container, base, baseIndex, trip, tripIndex) {
		const nestedList = document.createElement('div');
		nestedList.className = 'tl-trips collapsed';
		nestedList.id = `tps-sub-${baseIndex}-${tripIndex}`;
		nestedList.style.marginLeft = '0.5rem';

		for (const nested of sortByTravelDate(childrenOf(trip))) {
			const nestedIndex = childrenOf(trip).indexOf(nested);
			const card = document.createElement('div');
			card.className = 'tl-trip';
			card.id = `t-${baseIndex}-${tripIndex}-sub-${nestedIndex}`;
			card.style.setProperty('--dot', base.color);
			card.innerHTML = `<div class="tl-trip-dot" style="background:${base.color};box-shadow:0 0 0 1.5px ${base.color},0 1px 3px rgba(0,0,0,0.12);"></div>
				<div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
					<span class="tl-trip-year">${formatTravelDate(nested)}</span>
					<span class="tl-trip-city">${nested.city}</span><span class="tl-trip-prov">${nested.province}</span>${articleLink(nested.slug, { compact: true })}
				</div>
				${nested.note ? `<div class="tl-trip-note">${nested.note}</div>` : ''}`;
			card.addEventListener('click', (event) => {
				event.stopPropagation();
				selectNestedTrip(baseIndex, tripIndex, nestedIndex);
			});
			activateWithKeyboard(card, () => selectNestedTrip(baseIndex, tripIndex, nestedIndex));
			card.addEventListener('mouseenter', () => pulse(nested.lat, nested.lng, true));
			card.addEventListener('mouseleave', () => pulse(nested.lat, nested.lng, false));
			nestedList.appendChild(card);
		}
		container.appendChild(nestedList);
	}

	function renderTrips(container, base, baseIndex) {
		for (const trip of sortByTravelDate(childrenOf(base))) {
			const tripIndex = childrenOf(base).indexOf(trip);
			if (trip.kind === 'stay') {
				const card = document.createElement('div');
				card.className = 'tl-base-sub';
				card.id = `b-${baseIndex}-sub-${tripIndex}`;
				card.style.setProperty('--dot', base.color);
				const hasNestedTrips = childrenOf(trip).length > 0;
				card.innerHTML = `<div class="tl-dot-sub"></div>
					${hasNestedTrips ? `<button type="button" class="tl-toggle flipped" data-target="tps-sub-${baseIndex}-${tripIndex}" title="展开" aria-label="展开 ${trip.city} 的旅行" style="top:0.6rem;right:0.4rem;">${toggleIcon}</button>` : ''}
					<div class="tl-period" style="color:${base.color};font-size:0.68rem;">${formatTravelDate(trip)}</div>
					<div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
						<span class="tl-city" style="font-size:0.88rem;">${trip.city}</span><span class="tl-prov">${trip.province}</span>${articleLink(trip.slug, { compact: true })}
					</div>`;
				card.addEventListener('click', (event) => {
					event.stopPropagation();
					selectTrip(baseIndex, tripIndex);
				});
				activateWithKeyboard(card, () => selectTrip(baseIndex, tripIndex));
				card.addEventListener('mouseenter', () => pulse(trip.lat, trip.lng, true));
				card.addEventListener('mouseleave', () => pulse(trip.lat, trip.lng, false));
				card.querySelector('.tl-toggle')?.addEventListener('click', (event) => {
					event.stopPropagation();
					const id = `tps-sub-${baseIndex}-${tripIndex}`;
					setTripsExpanded(id, document.getElementById(id)?.classList.contains('collapsed'));
				});
				container.appendChild(card);
				if (hasNestedTrips) renderNestedTrips(container, base, baseIndex, trip, tripIndex);
				continue;
			}

			const card = document.createElement('div');
			card.className = 'tl-trip';
			card.id = `t-${baseIndex}-${tripIndex}`;
			card.style.setProperty('--dot', base.color);
			card.innerHTML = `<div class="tl-trip-dot" style="background:${base.color};box-shadow:0 0 0 1.5px ${base.color},0 1px 3px rgba(0,0,0,0.12);"></div>
				<div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
					<span class="tl-trip-year">${formatTravelDate(trip)}</span>
					<span class="tl-trip-city">${trip.city}</span><span class="tl-trip-prov">${trip.province}</span>${articleLink(trip.slug, { compact: true })}
				</div>
				${trip.note ? `<div class="tl-trip-note">${trip.note}</div>` : ''}`;
			card.addEventListener('click', (event) => {
				event.stopPropagation();
				selectTrip(baseIndex, tripIndex);
			});
			activateWithKeyboard(card, () => selectTrip(baseIndex, tripIndex));
			card.addEventListener('mouseenter', () => pulse(trip.lat, trip.lng, true));
			card.addEventListener('mouseleave', () => pulse(trip.lat, trip.lng, false));
			container.appendChild(card);
		}
	}

	function render() {
		const timeline = document.getElementById('timeline');
		timeline.replaceChildren();
		for (const base of sortByTravelDate(bases)) {
			const baseIndex = bases.indexOf(base);
			const card = document.createElement('div');
			card.className = 'tl-base';
			card.id = `b-${baseIndex}`;
			card.style.setProperty('--dot', base.color);
			card.innerHTML = `<div class="tl-dot" style="background:${base.color};box-shadow:0 0 0 2px ${base.color},0 1px 4px rgba(0,0,0,0.15);"></div>
				${childrenOf(base).length ? `<button type="button" class="tl-toggle flipped" data-target="tps-${baseIndex}" title="展开" aria-label="展开 ${base.city} 的旅行">${toggleIcon}</button>` : ''}
				<div class="tl-period" style="color:${base.color}">${formatTravelDate(base)}</div>
				<div style="display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
					<span class="tl-city">${base.city}</span><span class="tl-prov">${base.province}</span>${articleLink(base.slug, { compact: true })}
				</div>
				${base.summary || base.note ? `<div class="tl-note">${[base.summary, base.note].filter(Boolean).join(' · ')}</div>` : ''}`;
			card.addEventListener('click', () => selectBase(baseIndex));
			activateWithKeyboard(card, () => selectBase(baseIndex));
			card.addEventListener('mouseenter', () => pulse(base.lat, base.lng, true));
			card.addEventListener('mouseleave', () => pulse(base.lat, base.lng, false));
			card.querySelector('.tl-toggle')?.addEventListener('click', (event) => {
				event.stopPropagation();
				const id = `tps-${baseIndex}`;
				setTripsExpanded(id, document.getElementById(id)?.classList.contains('collapsed'));
			});

			const trips = document.createElement('div');
			trips.className = 'tl-trips collapsed';
			trips.id = `tps-${baseIndex}`;
			renderTrips(trips, base, baseIndex);
			timeline.append(card, trips);
		}
	}

	function syncFromMap(marker) {
		if (selection.suppressMapSync) return;
		stopJourney();
		clearSelection();
		const context = marker.contexts[0];
		if (!context) return;

		setTripsExpanded(`tps-${context.bi}`, true);
		const baseCard = document.getElementById(`b-${context.bi}`);
		baseCard?.classList.add('sel');
		selection.base = context.bi;

		let selectedCard = baseCard;
		if (context.type === 'stay') {
			selectedCard = document.getElementById(`b-${context.bi}-sub-${context.ti}`);
			selection.trip = `${context.bi}-${context.ti}`;
		} else if (context.type === 'nested-visit') {
			setTripsExpanded(`tps-sub-${context.bi}-${context.ti}`, true);
			document.getElementById(`b-${context.bi}-sub-${context.ti}`)?.classList.add('sel');
			selectedCard = document.getElementById(`t-${context.bi}-${context.ti}-sub-${context.si}`);
			selection.trip = `${context.bi}-${context.ti}-sub-${context.si}`;
		} else if (context.type !== 'phase') {
			selectedCard = document.getElementById(`t-${context.bi}-${context.ti}`);
			selection.trip = `${context.bi}-${context.ti}`;
		}
		selectedCard?.classList.add('sel');
		selectedCard?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
		highlightMarker(coordinateKey(context.data.lat, context.data.lng), true);
		showBack(true);
	}

	return {
		clearSelection,
		isSyncSuppressed: () => selection.suppressMapSync,
		render,
		syncFromMap,
	};
}
