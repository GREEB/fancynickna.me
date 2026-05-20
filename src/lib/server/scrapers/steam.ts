import { db } from '../db';
import { games, scrapeJobs } from '../db/schema';
import { sql } from 'drizzle-orm';
import { fetchWithRetry, slugify, sleep } from './util';

// Steam's free public ISteamApps/GetAppList endpoint started 403-ing without an
// API key, so we use SteamSpy's "all" endpoint which mirrors the Steam catalog
// pre-ranked by popularity (1000 games per page, ~20 pages total). source stays
// 'steam' because the underlying apps are still Steam apps.
const STEAMSPY_ALL = 'https://steamspy.com/api.php?request=all&page=';
const APP_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';

interface SteamSpyEntry {
	appid: number;
	name: string;
	developer?: string;
	publisher?: string;
	owners?: string;
	ccu?: number;
	price?: string;
}

export async function scrapeSteam(opts: { enrichTop?: number; throttleMs?: number; maxPages?: number; startPage?: number } = {}) {
	const enrichTop = opts.enrichTop ?? 0;
	// SteamSpy "all" is rate-limited to 1 req / 60s; appdetails throttle is separate (1500ms is plenty).
	const throttleMs = opts.throttleMs ?? 1500;
	const allPageDelayMs = 65_000;
	const maxPages = opts.maxPages ?? 3;
	const startPage = opts.startPage ?? 0;

	const [{ id: jobId }] = await db
		.insert(scrapeJobs)
		.values({ source: 'steam', status: 'running' })
		.returning({ id: scrapeJobs.id });

	let upserted = 0;
	let enriched = 0;

	try {
		// Pre-load every existing slug so we never INSERT a duplicate. For Steam
		// rows we also remember `appid → existing slug` so re-scraping an already-
		// known appid reuses its slug instead of slugifying again (which could
		// collide with a different appid's existing slug).
		const allRows = await db.select({ slug: games.slug, source: games.source, sourceId: games.sourceId }).from(games);
		const claimed = new Set<string>(allRows.map((r) => r.slug));
		const existingSteamSlug = new Map<string, string>();
		for (const r of allRows) {
			if (r.source === 'steam') existingSteamSlug.set(r.sourceId, r.slug);
		}

		// Insert per-page rather than buffering everything in memory: if a single
		// page errors after retries (SteamSpy occasionally serves 500s on specific
		// pages — we hit this on page 31 once), we keep the data from earlier pages.
		const skippedPages: number[] = [];
		for (let page = startPage; page < startPage + maxPages; page++) {
			console.log(`[steam] fetching page ${page}…`);
			let entries: SteamSpyEntry[] = [];
			try {
				const res = await fetchWithRetry(`${STEAMSPY_ALL}${page}`);
				if (!res.ok) throw new Error(`steamspy page ${page}: ${res.status}`);
				const json = (await res.json()) as Record<string, SteamSpyEntry> | unknown[];
				entries = Array.isArray(json) ? [] : Object.values(json);
			} catch (e) {
				console.warn(`[steam] page ${page} failed after retries, skipping:`, e instanceof Error ? e.message : e);
				skippedPages.push(page);
				if (page < startPage + maxPages - 1) await sleep(allPageDelayMs);
				continue;
			}

			if (entries.length === 0) {
				console.log(`[steam] page ${page} empty, stopping`);
				break;
			}

			// Filter + dedupe within this page
			const apps = entries
				.filter((a) => a.name && a.name.trim().length > 0 && Number.isFinite(a.appid))
				.filter((a, i, arr) => arr.findIndex((b) => b.appid === a.appid) === i);

			// Pages return entries in popularity order; lower page = more popular.
			// Score from 0 to 50 anchored on the page-relative rank within the page.
			const rows = apps.map((a, j) => {
				const rank = page * 1000 + j;
				const appidStr = String(a.appid);
				// If this appid is already in DB, reuse its existing slug — the
				// upsert will hit the (source, sourceId) key and not try to insert
				// a new row, so we must preserve the column we're sending.
				let slug = existingSteamSlug.get(appidStr);
				if (!slug) {
					const base = slugify(a.name) || `steam-${a.appid}`;
					slug = claimed.has(base) ? `${base}-${a.appid}` : base;
				}
				claimed.add(slug);
				existingSteamSlug.set(appidStr, slug);
				return {
					slug,
					name: a.name,
					platform: 'pc',
					source: 'steam',
					sourceId: String(a.appid),
					popularityScore: Math.max(0, 50 - rank * 0.001),
					lastScrapedAt: new Date()
				};
			});

			// Chunked insert in case a single page somehow had >500 rows
			const chunkSize = 500;
			for (let i = 0; i < rows.length; i += chunkSize) {
				const chunk = rows.slice(i, i + chunkSize);
				await db
					.insert(games)
					.values(chunk)
					.onConflictDoUpdate({
						target: [games.source, games.sourceId],
						set: {
							name: sql`excluded.name`,
							popularityScore: sql`excluded.popularity_score`,
							lastScrapedAt: sql`excluded.last_scraped_at`,
							updatedAt: new Date()
						}
					});
				upserted += chunk.length;
			}
			console.log(`[steam] page ${page}: upserted ${rows.length} (running total: ${upserted})`);

			if (page < startPage + maxPages - 1) await sleep(allPageDelayMs);
		}

		if (skippedPages.length) {
			console.warn(`[steam] skipped pages: ${skippedPages.join(', ')}`);
		}

		if (enrichTop > 0) {
			const popular = await db.query.games.findMany({
				where: (g, { eq }) => eq(g.source, 'steam'),
				orderBy: (g, { desc }) => desc(g.popularityScore),
				limit: enrichTop
			});

			for (const g of popular) {
				try {
					const detailRes = await fetchWithRetry(
						`${APP_DETAILS_URL}?appids=${g.sourceId}&l=english`
					);
					const detail = (await detailRes.json()) as Record<string, { success: boolean; data?: SteamAppDetail }>;
					const entry = detail[g.sourceId];
					if (entry?.success && entry.data) {
						await db
							.update(games)
							.set({
								description: entry.data.short_description ?? null,
								coverUrl: entry.data.header_image ?? null,
								iconUrl: entry.data.capsule_image ?? null,
								genre: entry.data.genres?.[0]?.description ?? null,
								releaseYear: parseReleaseYear(entry.data.release_date?.date),
								updatedAt: new Date()
							})
							.where(sql`${games.id} = ${g.id}`);
						enriched++;
					}
				} catch (err) {
					console.warn(`enrich ${g.sourceId} failed`, err);
				}
				await sleep(throttleMs);
			}
		}

		await db
			.update(scrapeJobs)
			.set({
				status: 'success',
				stats: { upserted, enriched, total: upserted },
				finishedAt: new Date()
			})
			.where(sql`${scrapeJobs.id} = ${jobId}`);

		return { upserted, enriched, total: upserted };
	} catch (err) {
		await db
			.update(scrapeJobs)
			.set({
				status: 'failed',
				error: err instanceof Error ? err.message : String(err),
				finishedAt: new Date()
			})
			.where(sql`${scrapeJobs.id} = ${jobId}`);
		throw err;
	}
}

interface SteamAppDetail {
	short_description?: string;
	header_image?: string;
	capsule_image?: string;
	genres?: { id: string; description: string }[];
	release_date?: { coming_soon: boolean; date: string };
}

function parseReleaseYear(date?: string): number | null {
	if (!date) return null;
	const m = date.match(/\b(19|20)\d{2}\b/);
	return m ? Number.parseInt(m[0], 10) : null;
}
