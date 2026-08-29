import type L from 'leaflet';

export function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mapTransitionOptions(duration: number): L.ZoomPanOptions {
	return prefersReducedMotion() ? { animate: false, duration: 0 } : { animate: true, duration };
}

export function scrollBehavior() {
	return prefersReducedMotion() ? 'auto' : 'smooth';
}
