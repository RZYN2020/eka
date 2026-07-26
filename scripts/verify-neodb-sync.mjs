import assert from 'node:assert/strict';
import {
	createSyncPayload,
	fetchJsonWithRetry,
	isSameSyncData,
} from './lib/neodb-sync.mjs';

const existing = {
	syncedAt: '2026-01-01T00:00:00.000Z',
	source: 'https://neodb.social',
	shelves: { progress: [], complete: [], wishlist: [], dropped: [] },
	reviews: [],
};
const unchanged = createSyncPayload(existing, {
	source: existing.source,
	shelves: existing.shelves,
	reviews: existing.reviews,
}, '2026-07-26T00:00:00.000Z');

assert.equal(unchanged.changed, false);
assert.strictEqual(unchanged.payload, existing);
assert.equal(isSameSyncData(existing, unchanged.payload), true);

const changed = createSyncPayload(existing, {
	source: existing.source,
	shelves: { ...existing.shelves, progress: [{ item: { uuid: 'new' } }] },
	reviews: [],
}, '2026-07-26T00:00:00.000Z');
assert.equal(changed.changed, true);
assert.equal(changed.payload.syncedAt, '2026-07-26T00:00:00.000Z');

let attempts = 0;
const result = await fetchJsonWithRetry('https://example.test/data', {
	retries: 2,
	timeoutMs: 50,
	sleep: async () => {},
	fetchImpl: async () => {
		attempts += 1;
		if (attempts === 1) return new Response('busy', { status: 503 });
		return Response.json({ pages: 1, data: [] });
	},
	validate: (value) => (
		typeof value === 'object'
		&& value !== null
		&& Array.isArray(value.data)
	),
});
assert.equal(attempts, 2);
assert.deepEqual(result, { pages: 1, data: [] });

await assert.rejects(
	() => fetchJsonWithRetry('https://example.test/data', {
		retries: 0,
		timeoutMs: 50,
		fetchImpl: async () => Response.json({ pages: 1 }),
		validate: (value) => (
			typeof value === 'object'
			&& value !== null
			&& Array.isArray(value.data)
		),
	}),
	/invalid JSON shape/i,
);

console.log('NeoDB sync retries transient failures and preserves timestamps when data is unchanged.');
