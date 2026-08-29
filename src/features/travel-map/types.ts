import type L from 'leaflet';

export type TravelKind = 'phase' | 'stay' | 'visit';

export interface TravelDate {
	start: string;
	end?: string | null;
	label?: string;
	sequence?: number;
	endSequence?: number;
}

export interface Coordinates {
	lat: number;
	lng: number;
}

export interface TravelPlace extends Partial<Coordinates> {
	kind: TravelKind;
	city: string;
	province: string;
	date: TravelDate;
	children?: TravelPlace[];
	color?: string;
	note?: string;
	summary?: string;
	slug?: string;
	coordinates?: Coordinates;
}

export type MarkerContextType = TravelKind | 'nested-visit';

export interface MarkerContext {
	type: MarkerContextType;
	bi: number;
	ti?: number;
	si?: number;
	data: TravelPlace & Coordinates;
	period: string;
}

export interface MarkerEntry extends Coordinates {
	marker: L.Marker & { _icon?: HTMLElement; _cm?: MarkerEntry };
	key: string;
	color: string;
	isBase: boolean;
	contexts: MarkerContext[];
}

export interface GeoJsonFeature {
	type: 'Feature';
	properties: Record<string, unknown> & {
		name?: string;
		NAME?: string;
		admin?: string;
		name_long?: string;
		center?: [number, number];
	};
	geometry: GeoJSON.Geometry;
}

export interface GeoJsonCollection {
	type: 'FeatureCollection';
	features: GeoJsonFeature[];
}
