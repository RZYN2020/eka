import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type RouteFeature = GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString, {
	title: string;
	date: string;
	maxZoom: number;
	routeId?: string;
}>;

type RouteCollection = GeoJSON.FeatureCollection<GeoJSON.LineString | GeoJSON.MultiLineString, RouteFeature['properties']>;
type Coordinate = [number, number];

let routeCollection: Promise<RouteCollection> | undefined;
let estimatedRouteCollection: Promise<RouteCollection> | undefined;

function routeStyle(direction: 'outbound' | 'return'): L.PathOptions {
	return {
		color: direction === 'outbound' ? '#2563c7' : '#d95436',
		weight: 4,
		opacity: 0.9,
		dashArray: direction === 'return' ? '10 6' : undefined,
		lineCap: 'round',
		lineJoin: 'round',
	};
}

function offsetOverlappingCoordinates(
	coordinates: GeoJSON.Position[],
	referenceLines: GeoJSON.Position[][],
	map: L.Map,
	minimumIndexGap = 0,
): GeoJSON.Position[] {
	if (coordinates.length < 3 || referenceLines.length === 0) return coordinates;

	const metersPerLatitude = 110_574;
	const matched = coordinates.map((coordinate, index) => {
		const longitude = coordinate[0] ?? 0;
		const latitude = coordinate[1] ?? 0;
		const metersPerLongitude = metersPerLatitude * Math.cos((latitude * Math.PI) / 180);
		const point: Coordinate = [longitude * metersPerLongitude, latitude * metersPerLatitude];
		let nearest: { distance: number; normal: Coordinate } | undefined;

		for (const line of referenceLines) {
			const lastSegmentIndex = line === coordinates ? index - minimumIndexGap : line.length - 1;
			for (let segmentIndex = 1; segmentIndex <= lastSegmentIndex; segmentIndex += 1) {
				const start = line[segmentIndex - 1];
				const end = line[segmentIndex];
				if (!start || !end) continue;
				const startPoint: Coordinate = [
					(start[0] ?? 0) * metersPerLongitude,
					(start[1] ?? 0) * metersPerLatitude,
				];
				const endPoint: Coordinate = [
					(end[0] ?? 0) * metersPerLongitude,
					(end[1] ?? 0) * metersPerLatitude,
				];
				const dx = endPoint[0] - startPoint[0];
				const dy = endPoint[1] - startPoint[1];
				const lengthSquared = dx * dx + dy * dy;
				if (lengthSquared === 0) continue;
				const projection = Math.max(0, Math.min(1,
					((point[0] - startPoint[0]) * dx + (point[1] - startPoint[1]) * dy) / lengthSquared,
				));
				const distanceX = point[0] - (startPoint[0] + projection * dx);
				const distanceY = point[1] - (startPoint[1] + projection * dy);
				const distance = Math.hypot(distanceX, distanceY);
				if (!nearest || distance < nearest.distance) {
					nearest = { distance, normal: [-dy / Math.sqrt(lengthSquared), dx / Math.sqrt(lengthSquared)] };
				}
			}
		}

		return nearest && nearest.distance <= 12 ? { coordinate, nearest } : undefined;
	});
	const result = coordinates.map((coordinate) => [...coordinate]);
	let runStart = -1;
	const offsetRun = (runEnd: number) => {
		if (runStart < 0 || runEnd - runStart < 2) return;
		for (let index = runStart; index <= runEnd; index += 1) {
			const match = matched[index];
			const source = coordinates[index];
			const shifted = result[index];
			if (!match || !source || !shifted) continue;
			const fade = Math.min(1, (index - runStart + 1) / 3, (runEnd - index + 1) / 3);
			const latitude = source[1] ?? 0;
			const metersPerLongitude = metersPerLatitude * Math.cos((latitude * Math.PI) / 180);
			const metersPerPixel = 156_543.03392 * Math.cos((latitude * Math.PI) / 180) / 2 ** map.getZoom();
			const offset = Math.min(20, 3.5 * metersPerPixel) * fade;
			shifted[0] = (source[0] ?? 0) + (match.nearest.normal[0] * offset) / metersPerLongitude;
			shifted[1] = latitude + (match.nearest.normal[1] * offset) / metersPerLatitude;
		}
	};

	for (let index = 0; index <= matched.length; index += 1) {
		if (matched[index]) {
			if (runStart < 0) runStart = index;
		} else if (runStart >= 0) {
			offsetRun(index - 1);
			runStart = -1;
		}
	}
	return result;
}

function distanceMeters(start: GeoJSON.Position, end: GeoJSON.Position) {
	const radians = Math.PI / 180;
	const latitude1 = (start[1] ?? 0) * radians;
	const latitude2 = (end[1] ?? 0) * radians;
	const latitudeDelta = latitude2 - latitude1;
	const longitudeDelta = ((end[0] ?? 0) - (start[0] ?? 0)) * radians;
	const haversine = Math.sin(latitudeDelta / 2) ** 2
		+ Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
	return 12_742_000 * Math.asin(Math.sqrt(haversine));
}

function addDirectionArrows(
	map: L.Map,
	lines: GeoJSON.Position[][],
	direction: 'outbound' | 'return',
) {
	const drawableLines = lines.filter((line) => line.length > 1);
	const totalDistance = drawableLines.reduce((total, line) => {
		return total + line.slice(1).reduce((length, point, index) => length + distanceMeters(line[index]!, point), 0);
	}, 0);
	if (totalDistance < 100) return;

	const arrowCount = Math.min(6, Math.max(2, Math.floor(totalDistance / 12_000)));
	for (let arrowIndex = 1; arrowIndex <= arrowCount; arrowIndex += 1) {
		let remaining = (totalDistance * arrowIndex) / (arrowCount + 1);
		let location: L.LatLngTuple | undefined;
		let heading: number | undefined;

		for (const line of drawableLines) {
			for (let pointIndex = 1; pointIndex < line.length; pointIndex += 1) {
				const start = line[pointIndex - 1]!;
				const end = line[pointIndex]!;
				const segmentLength = distanceMeters(start, end);
				if (remaining > segmentLength) {
					remaining -= segmentLength;
					continue;
				}

				const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
				const latitude = (start[1] ?? 0) + ((end[1] ?? 0) - (start[1] ?? 0)) * ratio;
				const longitude = (start[0] ?? 0) + ((end[0] ?? 0) - (start[0] ?? 0)) * ratio;
				const startPoint = map.latLngToLayerPoint([start[1] ?? 0, start[0] ?? 0]);
				const endPoint = map.latLngToLayerPoint([end[1] ?? 0, end[0] ?? 0]);
				location = [latitude, longitude];
				heading = (Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180) / Math.PI;
				break;
			}
			if (location) break;
		}

		if (!location || heading === undefined) continue;
		const colorClass = direction === 'outbound' ? 'route-direction-arrow--outbound' : 'route-direction-arrow--return';
		const icon = L.divIcon({
			className: `route-direction-arrow ${colorClass}`,
			html: `<svg aria-hidden="true" viewBox="0 0 24 24" style="transform:rotate(${heading}deg)"><path d="M3 2 22 12 3 22 7.5 12z" /></svg>`,
			iconSize: [14, 14],
			iconAnchor: [7, 7],
		});
		L.marker(location, { icon, interactive: false, keyboard: false, zIndexOffset: 100 }).addTo(map);
	}
}

function loadRoutes(url: string) {
	routeCollection ??= fetch(url).then(async (response) => {
		if (!response.ok) throw new Error(`Route data request failed: ${response.status}`);
		return (await response.json()) as RouteCollection;
	});
	return routeCollection;
}

function loadEstimatedRoutes(url: string) {
	estimatedRouteCollection ??= fetch(url).then(async (response) => {
		if (!response.ok) throw new Error(`Estimated route data request failed: ${response.status}`);
		return (await response.json()) as RouteCollection;
	});
	return estimatedRouteCollection;
}

async function initializeMap(element: HTMLElement) {
	const routeId = element.dataset.routeId;
	const routeUrl = element.dataset.routeSrc;
	const estimatedRouteUrl = element.dataset.estimatedRouteSrc;
	const directions = element.dataset.routeDirections;
	const singleDirection = element.dataset.routeDirection === 'return' ? 'return' : 'outbound';
	if (!routeId || !routeUrl) return;

	try {
		const routes = await loadRoutes(routeUrl);
		const route = routes.features.find((feature) => feature.id === routeId);
		if (!route) throw new Error(`Route not found: ${routeId}`);

		element.replaceChildren();
		const map = L.map(element, {
			zoomControl: true,
			scrollWheelZoom: false,
			attributionControl: true,
			preferCanvas: true,
		});
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
		}).addTo(map);

		const routeLines = route.geometry.type === 'LineString'
			? [route.geometry.coordinates]
			: route.geometry.coordinates;
		const selfOverlap = element.dataset.offsetSelfOverlaps === 'true';
		const track = L.featureGroup(routeLines.map((line, index) => L.polyline(
				line.map(([longitude, latitude]) => [latitude, longitude] as L.LatLngTuple),
				routeStyle(directions === 'outbound-return' && index > 0
					? 'return'
					: directions === 'outbound-return' ? 'outbound' : singleDirection),
			))).addTo(map);
		const estimatedRoutes = estimatedRouteUrl
			? await loadEstimatedRoutes(estimatedRouteUrl)
			: undefined;
		const estimatedFeatures = estimatedRoutes?.features.filter(
			(feature) => feature.properties.routeId === routeId,
		);
		const estimatedLines = estimatedFeatures?.flatMap((feature) =>
			feature.geometry.type === 'LineString'
				? [feature.geometry.coordinates]
				: feature.geometry.coordinates,
		);
		const estimatedTrack = estimatedFeatures?.length
			? L.featureGroup(estimatedLines!.map((line) =>
				L.polyline(
					line.map(([longitude, latitude]) => [latitude, longitude] as L.LatLngTuple),
					routeStyle(directions === 'outbound-return' ? 'return' : singleDirection),
				),
			)).addTo(map)
			: undefined;
		const bounds = track.getBounds();
		if (estimatedTrack) {
			bounds.extend(estimatedTrack.getBounds());
		}
		if (directions === 'outbound-return') {
			const legend = new L.Control({ position: 'topright' });
			legend.onAdd = () => {
				const container = L.DomUtil.create('div', 'ride-route-legend');
				container.innerHTML = '<span><i class="ride-route-legend__outbound"></i>去程</span><span><i class="ride-route-legend__return"></i>归程</span>';
				return container;
			};
			legend.addTo(map);
		}
		map.fitBounds(bounds, { padding: [28, 28], maxZoom: route.properties.maxZoom });
		const routeLayers = track.getLayers() as L.Polyline[];
		const estimatedLayers = estimatedTrack?.getLayers() as L.Polyline[] | undefined;
		let displayRouteLines: GeoJSON.Position[][] = routeLines;
		let displayEstimatedLines: GeoJSON.Position[][] | undefined = estimatedLines;
		const refreshOverlapOffsets = () => {
			displayRouteLines = routeLines.map((line, index) =>
				directions === 'outbound-return' && index > 0
					? offsetOverlappingCoordinates(line, [routeLines[0]!], map)
					: selfOverlap ? offsetOverlappingCoordinates(line, [line], map, 6) : line,
			);
			displayEstimatedLines = estimatedLines?.map((line) =>
				directions === 'outbound-return'
					? offsetOverlappingCoordinates(line, [routeLines[0]!], map)
					: line,
			);
			for (const [index, line] of displayRouteLines.entries()) {
				routeLayers[index]?.setLatLngs(line.map(([longitude, latitude]) => [latitude ?? 0, longitude ?? 0]));
			}
			for (const [index, line] of (displayEstimatedLines ?? []).entries()) {
				estimatedLayers?.[index]?.setLatLngs(line.map(([longitude, latitude]) => [latitude ?? 0, longitude ?? 0]));
			}
		};
		refreshOverlapOffsets();
		map.on('zoomend', refreshOverlapOffsets);
		if (directions === 'outbound-return') {
			addDirectionArrows(map, displayRouteLines.slice(0, 1), 'outbound');
			addDirectionArrows(map, [...displayRouteLines.slice(1), ...(displayEstimatedLines ?? [])], 'return');
		} else {
			addDirectionArrows(map, [...displayRouteLines, ...(displayEstimatedLines ?? [])], singleDirection);
		}
		requestAnimationFrame(() => map.invalidateSize({ pan: false }));
	} catch (error) {
		console.error('Unable to initialize GPS route map.', error);
		element.textContent = '路线地图暂时无法加载，请检查网络后刷新页面。';
		element.classList.add('gps-route-map--error');
	}
}

export function initializeRideRouteMaps() {
	const elements = [...document.querySelectorAll<HTMLElement>('.gps-route-map[data-route-id]')];
	if (elements.length === 0) return;

	if (!('IntersectionObserver' in window)) {
		for (const element of elements) void initializeMap(element);
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			observer.unobserve(entry.target);
			void initializeMap(entry.target as HTMLElement);
		}
	}, { rootMargin: '180px 0px' });

	for (const element of elements) observer.observe(element);
}
