import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { resolveNeoDBUrl } from '../src/lib/neodb.js';
import {
	createSyncPayload,
	fetchJsonWithRetry,
} from './lib/neodb-sync.mjs';

const API_ORIGIN = process.env.NEODB_API_ORIGIN || 'https://neodb.social';
const ACCESS_TOKEN = process.env.NEODB_ACCESS_TOKEN;
const OUTPUT_PATH = resolve('src/data/neodb/shelf.json');
const SHELF_TYPES = ['progress', 'complete', 'wishlist', 'dropped'];
const PUBLIC_VISIBILITY = 0;
const REQUEST_HEADERS = {
	Accept: 'application/json',
	Authorization: `Bearer ${ACCESS_TOKEN}`,
};

if (!ACCESS_TOKEN) {
	throw new Error('NEODB_ACCESS_TOKEN is not set. Add it to .env or the deployment secret store.');
}

function isPagePayload(value) {
	return typeof value === 'object'
		&& value !== null
		&& Array.isArray(value.data)
		&& (value.pages === undefined || Number.isFinite(Number(value.pages)));
}

async function fetchPage(shelfType, page) {
	const url = new URL(`/api/me/shelf/${shelfType}`, API_ORIGIN);
	url.searchParams.set('page', String(page));
	try {
		return await fetchJsonWithRetry(url, {
			headers: REQUEST_HEADERS,
			validate: isPagePayload,
		});
	} catch (error) {
		const detail = error.status === 401
			? 'The NeoDB token is missing, expired, or unauthorized.'
			: error.message;
		throw new Error(`Unable to sync the ${shelfType} shelf. ${detail}`, { cause: error });
	}
}

async function fetchReviewPage(page) {
	const url = new URL('/api/me/review/', API_ORIGIN);
	url.searchParams.set('page', String(page));

	try {
		return await fetchJsonWithRetry(url, {
			headers: REQUEST_HEADERS,
			validate: isPagePayload,
		});
	} catch (error) {
		throw new Error(`Unable to sync NeoDB reviews. ${error.message}`, { cause: error });
	}
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

for (const shelfType of SHELF_TYPES) {
	const result = await syncShelf(shelfType);
	shelves[shelfType] = result.items;
	console.log(`${shelfType}: ${result.items.length} public item(s), ${result.skipped} private item(s) skipped`);
}

const reviewResult = await syncReviews();
console.log(`reviews: ${reviewResult.items.length} public review(s), ${reviewResult.skipped} private review(s) skipped`);

const nextData = {
	source: API_ORIGIN,
	shelves,
	reviews: reviewResult.items,
};
const existing = await readFile(OUTPUT_PATH, 'utf8')
	.then((value) => JSON.parse(value))
	.catch((error) => {
		if (error.code === 'ENOENT') return null;
		throw error;
	});
const { changed, payload } = createSyncPayload(existing, nextData);

if (!changed) {
	console.log('NeoDB shelf is already current; no file changes written.');
	process.exit(0);
}

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
const temporaryPath = `${OUTPUT_PATH}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
await rename(temporaryPath, OUTPUT_PATH);
console.log(`NeoDB shelf written to ${OUTPUT_PATH}`);
