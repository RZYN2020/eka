function comparablePayload(payload) {
	return {
		source: payload?.source ?? '',
		shelves: payload?.shelves ?? {},
		reviews: payload?.reviews ?? [],
	};
}

export function isSameSyncData(left, right) {
	return JSON.stringify(comparablePayload(left)) === JSON.stringify(comparablePayload(right));
}

export function createSyncPayload(existing, next, syncedAt = new Date().toISOString()) {
	if (existing && isSameSyncData(existing, next)) {
		return { changed: false, payload: existing };
	}
	return {
		changed: true,
		payload: {
			syncedAt,
			...comparablePayload(next),
		},
	};
}

function shouldRetry(error) {
	return error?.name === 'AbortError'
		|| error?.name === 'TimeoutError'
		|| error?.status === 429
		|| error?.status >= 500;
}

export async function fetchJsonWithRetry(url, {
	fetchImpl = fetch,
	retries = 2,
	timeoutMs = 10_000,
	sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
	validate = () => true,
	headers,
} = {}) {
	let lastError;

	for (let attempt = 0; attempt <= retries; attempt += 1) {
		try {
			const response = await fetchImpl(url, {
				headers,
				signal: AbortSignal.timeout(timeoutMs),
			});
			if (!response.ok) {
				const error = new Error(`HTTP ${response.status}`);
				error.status = response.status;
				throw error;
			}

			const payload = await response.json();
			if (!validate(payload)) throw new Error('Remote service returned an invalid JSON shape.');
			return payload;
		} catch (error) {
			lastError = error;
			if (attempt === retries || !shouldRetry(error)) break;
			await sleep(250 * (2 ** attempt));
		}
	}

	throw lastError;
}
