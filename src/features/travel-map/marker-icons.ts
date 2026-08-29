import L from 'leaflet';

function hexRgba(hex: string, alpha: number) {
	return `rgba(${Number.parseInt(hex.slice(1, 3), 16)},${Number.parseInt(hex.slice(3, 5), 16)},${Number.parseInt(hex.slice(5, 7), 16)},${alpha})`;
}

export function baseIcon(color: string) {
	return L.divIcon({
		className: '',
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		popupAnchor: [0, -10],
		html: `<div style="width:16px;height:16px;background:${color};transform:rotate(45deg);border:2.5px solid white;border-radius:3px;box-shadow:0 0 0 3px ${hexRgba(color, 0.2)},0 2px 5px rgba(0,0,0,0.2);"></div>`,
	});
}

export function tripIcon(color: string) {
	return L.divIcon({
		className: '',
		iconSize: [11, 11],
		iconAnchor: [5.5, 5.5],
		popupAnchor: [0, -8],
		html: `<div style="width:11px;height:11px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 0 3px ${hexRgba(color, 0.18)},0 1px 4px rgba(0,0,0,0.18);"></div>`,
	});
}

export function stayIcon(color: string) {
	return L.divIcon({
		className: '',
		iconSize: [13, 13],
		iconAnchor: [6.5, 6.5],
		popupAnchor: [0, -9],
		html: `<div style="width:13px;height:13px;background:transparent;transform:rotate(45deg);border:2.5px solid ${color};border-radius:3px;box-shadow:0 0 0 3px ${hexRgba(color, 0.15)},0 1px 4px rgba(0,0,0,0.15);"></div>`,
	});
}
