const DEFAULT_NEODB_ORIGIN = 'https://neodb.social';

export function resolveNeoDBUrl(value, origin = DEFAULT_NEODB_ORIGIN) {
	return new URL(value || '/', origin).href;
}
