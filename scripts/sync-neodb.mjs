import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { resolveNeoDBUrl } from '../src/lib/neodb.js';

const API_ORIGIN = process.env.NEODB_API_ORIGIN || 'https://neodb.social';
const ACCESS_TOKEN = process.env.NEODB_ACCESS_TOKEN;
const OUTPUT_PATH = resolve('src/data/neodb/shelf.json');
const SHELF_TYPES = ['progress', 'complete', 'wishlist', 'dropped'];
const PUBLIC_VISIBILITY = 0;

if (!ACCESS_TOKEN) {
	throw new Error('NEODB_ACCESS_TOKEN is not set. Add it to .env or the deployment secret store.');
}

async function fetchPage(shelfType, page) {
	const url = new URL(`/api/me/shelf/${shelfType}`, API_ORIGIN);
	url.searchParams.set('page', String(page));

	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${ACCESS_TOKEN}`,
		},
	});

	if (!response.ok) {
		const detail = response.status === 401
			? 'The NeoDB token is missing, expired, or unauthorized.'
			: `NeoDB returned HTTP ${response.status}.`;
		throw new Error(`Unable to sync the ${shelfType} shelf. ${detail}`);
	}

	return response.json();
}

async function fetchReviewPage(page) {
	const url = new URL('/api/me/review/', API_ORIGIN);
	url.searchParams.set('page', String(page));

	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${ACCESS_TOKEN}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Unable to sync NeoDB reviews. NeoDB returned HTTP ${response.status}.`);
	}

	return response.json();
}

function normalizeMark(mark) {
	const item = mark.item ?? {};

	return {
		createdTime: mark.created_time,
		comment: mark.comment_text || '',
		ratingGrade: mark.rating_grade ?? null,
		item: {
			uuid: item.uuid,
			url: resolveNeoDBUrl(item.url, API_ORIGIN),
			category: item.category,
			title: item.display_title || item.localized_title?.[0]?.text || item.title,
			cover: item.cover_image_url || '',
		},
	};
}

async function syncShelf(shelfType) {
	const firstPage = await fetchPage(shelfType, 1);
	const totalPages = Math.max(1, Number(firstPage.pages) || 1);
	const pages = [firstPage];

	for (let page = 2; page <= totalPages; page += 1) {
		pages.push(await fetchPage(shelfType, page));
	}

	const allMarks = pages.flatMap((page) => page.data ?? []);
	const publicMarks = allMarks.filter((mark) => mark.visibility === PUBLIC_VISIBILITY);

	return {
		items: publicMarks.map(normalizeMark),
		total: allMarks.length,
		skipped: allMarks.length - publicMarks.length,
	};
}

async function syncReviews() {
	const firstPage = await fetchReviewPage(1);
	const totalPages = Math.max(1, Number(firstPage.pages) || 1);
	const pages = [firstPage];

	for (let page = 2; page <= totalPages; page += 1) {
		pages.push(await fetchReviewPage(page));
	}

	const allReviews = pages.flatMap((page) => page.data ?? []);
	const publicReviews = allReviews.filter((review) => review.visibility === PUBLIC_VISIBILITY);

	return {
		items: publicReviews.map((review) => ({
			url: resolveNeoDBUrl(review.url, API_ORIGIN),
			title: review.title || '长评',
			createdTime: review.created_time,
			itemUuid: review.item?.uuid,
		})).filter((review) => review.itemUuid),
		skipped: allReviews.length - publicReviews.length,
	};
}

const shelves = {};
let skippedPrivate = 0;

for (const shelfType of SHELF_TYPES) {
	const result = await syncShelf(shelfType);
	shelves[shelfType] = result.items;
	skippedPrivate += result.skipped;
	console.log(`${shelfType}: ${result.items.length} public item(s), ${result.skipped} private item(s) skipped`);
}

const reviewResult = await syncReviews();
skippedPrivate += reviewResult.skipped;
console.log(`reviews: ${reviewResult.items.length} public review(s), ${reviewResult.skipped} private review(s) skipped`);

const payload = {
	syncedAt: new Date().toISOString(),
	source: API_ORIGIN,
	shelves,
	reviews: reviewResult.items,
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
const temporaryPath = `${OUTPUT_PATH}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
await rename(temporaryPath, OUTPUT_PATH);
console.log(`NeoDB shelf written to ${OUTPUT_PATH}`);
