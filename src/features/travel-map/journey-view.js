import { elementById, queryElement } from './dom';
import { prefersReducedMotion } from './motion';

export function createJourneyView({ state, timelinePosition, currentLabel, seek }) {
	function updateTimeline(stop) {
		const position = timelinePosition(state.index);
		const track = elementById('journeyTimeTrack');
		elementById('journeyTimeCurrent').textContent = `${stop.dateLabel} · ${stop.city}`;
		elementById('journeyTimeFill').style.width = `${position}%`;
		queryElement('.journey-time-cursor').style.left = `${position}%`;
		track.setAttribute('aria-valuenow', String(state.index + 1));
		track.setAttribute('aria-valuetext', `${stop.dateLabel}，${stop.city}`);
	}

	function updateStatus(stop) {
		const status = elementById('journeyStatus');
		status.hidden = false;
		status.classList.remove('is-changing');
		if (!prefersReducedMotion()) {
			void status.offsetWidth;
			status.classList.add('is-changing');
		}
		elementById('journeyPeriod').textContent = stop.dateLabel;
		elementById('journeyCity').textContent = stop.city;
		elementById('journeySummary').textContent = stop.action;
		elementById('journeyProgress').textContent = `${state.index + 1} / ${state.stops.length}`;
		updateTimeline(stop);
	}

	function resetButton(label = '人生轨迹') {
		const button = elementById('btnJourney');
		button.textContent = label;
		button.setAttribute('aria-pressed', 'false');
	}

	function updateControls() {
		const playButton = elementById('btnJourneyPlay');
		const finished = state.stops.length > 0 && state.index >= state.stops.length - 1;
		playButton.textContent = finished ? '重播' : state.playing ? '暂停' : '自动播放';
		playButton.setAttribute('aria-pressed', String(state.playing));
		elementById('btnJourneyNext').disabled = state.moving || finished;
	}

	function renderTimeline() {
		const timeline = elementById('journeyTimeline');
		const track = elementById('journeyTimeTrack');
		const ticks = elementById('journeyTimeTicks');
		const first = state.stops[0];
		const last = state.stops.at(-1);
		timeline.hidden = false;
		elementById('journeyTimeStart').textContent = first.date.start.slice(0, 4);
		elementById('journeyTimeCurrent').textContent = first.dateLabel;
		elementById('journeyTimeEnd').textContent = last.date.start.replaceAll('-', '.');
		track.setAttribute('aria-valuemax', String(state.stops.length));
		track.setAttribute('aria-valuenow', '1');
		ticks.replaceChildren(
			...state.stops.flatMap((stop, index) => {
				if (stop.derived) return [];
				const marker = document.createElement('button');
				const markerClass =
					stop.kind === 'phase' ? 'is-phase' : stop.kind === 'stay' ? 'is-stay' : 'is-visit';
				const label = `${stop.dateLabel} · ${stop.city} · ${stop.action}`;
				marker.type = 'button';
				marker.tabIndex = -1;
				marker.className = markerClass;
				marker.dataset.index = String(index);
				marker.dataset.label = label;
				marker.style.left = `${timelinePosition(index)}%`;
				marker.setAttribute('aria-label', label);
				marker.title = label;
				marker.addEventListener('click', (event) => {
					event.stopPropagation();
					seek(index);
				});
				marker.addEventListener('mouseenter', () => {
					elementById('journeyTimeCurrent').textContent = label;
				});
				marker.addEventListener('mouseleave', () => {
					elementById('journeyTimeCurrent').textContent = currentLabel();
				});
				return [marker];
			}),
		);
		elementById('journeyTimeFill').style.width = '0%';
		queryElement('.journey-time-cursor').style.left = '0%';
	}

	return { renderTimeline, resetButton, updateControls, updateStatus };
}
