import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const targets = [
	{
		file: 'public/geojson/china-cities.json',
		precision: 3,
		tolerance: 0.004,
		properties: ['name', 'adcode', 'center'],
	},
	{
		file: 'public/geojson/china.json',
		precision: 3,
		tolerance: 0.003,
		properties: ['name', 'adcode', 'center'],
	},
	{
		file: 'public/geojson/world.json',
		precision: 3,
		tolerance: 0.015,
		properties: ['name', 'NAME', 'admin', 'name_long'],
	},
];

function roundCoordinates(value, precision) {
	if (typeof value === 'number') return Number(value.toFixed(precision));
	if (Array.isArray(value)) return value.map((item) => roundCoordinates(item, precision));
	return value;
}

function pointSegmentDistanceSquared(point, start, end) {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];
	if (dx === 0 && dy === 0) return (point[0] - start[0]) ** 2 + (point[1] - start[1]) ** 2;
	const ratio = Math.max(0, Math.min(1,
		((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx ** 2 + dy ** 2),
	));
	const x = start[0] + ratio * dx;
	const y = start[1] + ratio * dy;
	return (point[0] - x) ** 2 + (point[1] - y) ** 2;
}

function simplifyLine(points, tolerance, closed = false) {
	if (points.length <= (closed ? 4 : 2)) return points;
	const source = closed && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
		? points.slice(0, -1)
		: points;
	const keep = new Uint8Array(source.length);
	keep[0] = 1;
	keep[source.length - 1] = 1;
	const stack = [[0, source.length - 1]];
	const threshold = tolerance ** 2;
	while (stack.length) {
		const [start, end] = stack.pop();
		let furthest = -1;
		let distance = threshold;
		for (let index = start + 1; index < end; index += 1) {
			const candidate = pointSegmentDistanceSquared(source[index], source[start], source[end]);
			if (candidate > distance) {
				distance = candidate;
				furthest = index;
			}
		}
		if (furthest !== -1) {
			keep[furthest] = 1;
			stack.push([start, furthest], [furthest, end]);
		}
	}
	const simplified = source.filter((_, index) => keep[index]);
	if (!closed) return simplified;
	if (simplified.length < 3) return points;
	return [...simplified, simplified[0]];
}

function simplifyGeometry(geometry, tolerance) {
	if (!geometry?.coordinates) return;
	if (geometry.type === 'LineString') geometry.coordinates = simplifyLine(geometry.coordinates, tolerance);
	if (geometry.type === 'MultiLineString') {
		geometry.coordinates = geometry.coordinates.map((line) => simplifyLine(line, tolerance));
	}
	if (geometry.type === 'Polygon') {
		geometry.coordinates = geometry.coordinates.map((ring) => simplifyLine(ring, tolerance, true));
	}
	if (geometry.type === 'MultiPolygon') {
		geometry.coordinates = geometry.coordinates.map((polygon) =>
			polygon.map((ring) => simplifyLine(ring, tolerance, true)));
	}
}

for (const target of targets) {
	const absolutePath = path.join(root, target.file);
	const source = JSON.parse(await fs.readFile(absolutePath, 'utf8'));
	for (const feature of source.features ?? []) {
		feature.properties = Object.fromEntries(target.properties
			.filter((key) => feature.properties?.[key] !== undefined)
			.map((key) => [key, feature.properties[key]]));
		if (feature.geometry?.coordinates) {
			feature.geometry.coordinates = roundCoordinates(feature.geometry.coordinates, target.precision);
			simplifyGeometry(feature.geometry, target.tolerance);
		}
	}
	const temporaryPath = `${absolutePath}.tmp`;
	await fs.writeFile(temporaryPath, JSON.stringify(source));
	await fs.rename(temporaryPath, absolutePath);
	const size = (await fs.stat(absolutePath)).size;
	console.log(`${target.file}: ${(size / 1024 / 1024).toFixed(2)} MiB`);
}
