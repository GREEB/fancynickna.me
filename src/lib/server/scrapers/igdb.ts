import { db } from '../db';
import { games, scrapeJobs } from '../db/schema';
import { sql, eq, and, desc } from 'drizzle-orm';
import { fetchWithRetry, sleep } from './util';

// IGDB is owned by Twitch and uses Twitch OAuth's client_credentials flow.
// One app token, ~60 day TTL. We fetch it once at the start of the run and
// reuse for every request. Rate limit: 4 req/sec, so we sleep ~300ms between.

const IGDB_BASE = 'https://api.igdb.com/v4';
const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

interface IGDBExternalGame {
	id: number;
	game: number;
	uid: string;
}
interface IGDBGame {
	id: number;
	name: string;
	cover?: { image_id: string };
	screenshots?: { image_id: string }[];
	summary?: string;
	first_release_date?: number; // unix seconds
	genres?: { name: string }[];
	themes?: { name: string }[];
}

interface AppToken {
	access_token: string;
	expires_in: number;
}

async function getAppToken(clientId: string, clientSecret: string): Promise<string> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		grant_type: 'client_credentials'
	});
	const res = await fetchWithRetry(TOKEN_URL, { method: 'POST', body });
	if (!res.ok) throw new Error(`twitch oauth: ${res.status} ${await res.text()}`);
	const json = (await res.json()) as AppToken;
	return json.access_token;
}

async function igdbQuery<T>(endpoint: string, query: string, clientId: string, token: string): Promise<T[]> {
	const res = await fetchWithRetry(`${IGDB_BASE}/${endpoint}`, {
		method: 'POST',
		headers: {
			'Client-ID': clientId,
			Authorization: `Bearer ${token}`,
			'Content-Type': 'text/plain',
			Accept: 'application/json'
		},
		body: query
	});
	if (!res.ok) throw new Error(`igdb ${endpoint}: ${res.status} ${await res.text()}`);
	return (await res.json()) as T[];
}

// IGDB images: https://images.igdb.com/igdb/image/upload/t_<size>/<image_id>.jpg
// t_cover_big = 264×374, t_screenshot_med = 569×320, t_screenshot_big = 889×500
function igdbImg(imageId: string, size: 'cover_big' | 'screenshot_med' | 'screenshot_big' | 'thumb'): string {
	return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

// Curated games aren't keyed by a Steam appid — sourceId is their slug. To
// enrich them we search IGDB by name and pick the best match (exact name when
// available, otherwise the first/highest-popularity result).
export async function scrapeIGDBCurated(opts: { throttleMs?: number } = {}) {
	const throttleMs = opts.throttleMs ?? 300;
	const clientId = process.env.TWITCH_CLIENT_ID;
	const clientSecret = process.env.TWITCH_CLIENT_SECRET;
	if (!clientId || !clientSecret) throw new Error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not set');

	const [{ id: jobId }] = await db
		.insert(scrapeJobs)
		.values({ source: 'igdb-curated', status: 'running' })
		.returning({ id: scrapeJobs.id });

	let enriched = 0;
	let skipped = 0;

	try {
		const token = await getAppToken(clientId, clientSecret);
		const curated = await db.query.games.findMany({ where: eq(games.source, 'curated') });
		console.log(`[igdb-curated] enriching ${curated.length} curated games`);

		for (const g of curated) {
			// Skip social platforms — TikTok, Discord, Instagram, Twitch aren't games
			// and IGDB will only return junk fuzzy matches for them.
			if (g.platform === 'social') {
				skipped++;
				console.log(`[igdb-curated] skip "${g.name}" (social platform, not a game)`);
				continue;
			}

			const escaped = g.name.replace(/"/g, '\\"');
			// `search` in IGDB returns games ordered by relevance.
			const query = `search "${escaped}"; fields id, name, cover.image_id, screenshots.image_id, summary, first_release_date, genres.name; limit 6;`;
			let results: IGDBGame[] = [];
			try {
				results = await igdbQuery<IGDBGame>('games', query, clientId, token);
			} catch (e) {
				console.warn(`[igdb-curated] search failed for "${g.name}":`, e);
				skipped++;
				await sleep(throttleMs);
				continue;
			}

			// Only accept a match that's the exact name (case-insensitive) or a
			// prefix/superset. IGDB's "search" returns relevance-ordered fuzzy hits
			// that include unrelated games when the query has no matching title
			// (e.g. "The Finals" → "Final Fantasy IV"). Skipping is better than
			// wrong data — platforms like TikTok/Discord just won't get a cover.
			const lower = g.name.toLowerCase();
			const aliases = (g.aliases ?? []).map((a) => a.toLowerCase());
			function nameOk(r: IGDBGame): boolean {
				const rn = (r.name ?? '').toLowerCase();
				if (!rn) return false;
				if (rn === lower) return true;
				if (aliases.includes(rn)) return true;
				// Allow "Splitgate 2: Starter Pack" for query "Splitgate 2" — the IGDB
				// name must START with the curated name plus a separator.
				if (rn.startsWith(lower + ' ') || rn.startsWith(lower + ':')) return true;
				return false;
			}
			const best =
				results.find((r) => (r.name ?? '').toLowerCase() === lower) ??
				results.find(nameOk);

			if (!best) {
				console.log(`[igdb-curated] no exact match for "${g.name}", skipping`);
				skipped++;
				await sleep(throttleMs);
				continue;
			}

			const coverUrl = best.cover?.image_id ? igdbImg(best.cover.image_id, 'cover_big') : null;
			const screenshots = (best.screenshots ?? [])
				.slice(0, 6)
				.map((s) => igdbImg(s.image_id, 'screenshot_big'));
			const description = best.summary?.trim() ?? null;
			const releaseYear = best.first_release_date
				? new Date(best.first_release_date * 1000).getUTCFullYear()
				: null;
			const genre = best.genres?.[0]?.name ?? null;

			const now = new Date();
			await db
				.update(games)
				.set({
					coverUrl: coverUrl ?? g.coverUrl,
					screenshots: screenshots.length ? screenshots : g.screenshots,
					description: description ?? g.description,
					releaseYear: releaseYear ?? g.releaseYear,
					genre: genre ?? g.genre,
					updatedAt: now,
					lastScrapedAt: now
				})
				.where(eq(games.id, g.id));
			enriched++;
			console.log(`[igdb-curated] ✓ ${g.name} → ${best.name} (${coverUrl ? 'cover' : 'no cover'}, ${screenshots.length} shots)`);

			await sleep(throttleMs);
		}

		const now = new Date();
		await db
			.update(scrapeJobs)
			.set({
				status: 'success',
				stats: { enriched, skipped, total: curated.length },
				finishedAt: now
			})
			.where(sql`${scrapeJobs.id} = ${jobId}`);

		return { enriched, skipped, total: curated.length };
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

export async function scrapeIGDB(opts: { topN?: number; throttleMs?: number } = {}) {
	const topN = opts.topN ?? 200;
	const throttleMs = opts.throttleMs ?? 300;

	const clientId = process.env.TWITCH_CLIENT_ID;
	const clientSecret = process.env.TWITCH_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not set');
	}

	const [{ id: jobId }] = await db
		.insert(scrapeJobs)
		.values({ source: 'igdb', status: 'running' })
		.returning({ id: scrapeJobs.id });

	let matched = 0;
	let enriched = 0;
	let skipped = 0;

	try {
		const token = await getAppToken(clientId, clientSecret);

		// Pull the top-N Steam games we want to enrich, in popularity order.
		const steamGames = await db.query.games.findMany({
			where: eq(games.source, 'steam'),
			orderBy: desc(games.popularityScore),
			limit: topN
		});

		console.log(`[igdb] enriching top ${steamGames.length} steam games`);

		// Step 1: batch external_games lookups (500 uids per request) to find
		// IGDB game ids for the Steam appids we care about.
		const batchSize = 500;
		const appidToGameId = new Map<string, number>();
		for (let i = 0; i < steamGames.length; i += batchSize) {
			const batch = steamGames.slice(i, i + batchSize);
			const uids = batch.map((g) => `"${g.sourceId.replace(/"/g, '')}"`).join(',');
			// IGDB renamed `category` to `external_game_source` in 2024. Value 1 = Steam.
			const query = `fields game, uid; where external_game_source = 1 & uid = (${uids}); limit ${batch.length};`;
			const extGames = await igdbQuery<IGDBExternalGame>('external_games', query, clientId, token);
			for (const eg of extGames) appidToGameId.set(eg.uid, eg.game);
			await sleep(throttleMs);
		}

		matched = appidToGameId.size;
		console.log(`[igdb] matched ${matched}/${steamGames.length} steam appids to igdb game ids`);

		// Step 2: batch fetch the game details (500 ids per request) for everything we matched
		const gameIds = Array.from(new Set(appidToGameId.values()));
		const igdbById = new Map<number, IGDBGame>();
		for (let i = 0; i < gameIds.length; i += batchSize) {
			const batch = gameIds.slice(i, i + batchSize);
			const ids = batch.join(',');
			const query = `fields id, name, cover.image_id, screenshots.image_id, summary, first_release_date, genres.name, themes.name; where id = (${ids}); limit ${batch.length};`;
			const igdbGames = await igdbQuery<IGDBGame>('games', query, clientId, token);
			for (const g of igdbGames) igdbById.set(g.id, g);
			await sleep(throttleMs);
		}

		// Step 3: update each matched Steam row in-place with the IGDB enrichment.
		// We don't insert new rows — Steam is the canonical row, IGDB just enriches.
		const now = new Date();
		for (const sg of steamGames) {
			const igdbId = appidToGameId.get(sg.sourceId);
			if (!igdbId) {
				skipped++;
				continue;
			}
			const idata = igdbById.get(igdbId);
			if (!idata) {
				skipped++;
				continue;
			}
			const coverUrl = idata.cover?.image_id ? igdbImg(idata.cover.image_id, 'cover_big') : null;
			const screenshots = (idata.screenshots ?? [])
				.slice(0, 6)
				.map((s) => igdbImg(s.image_id, 'screenshot_big'));
			const description = idata.summary?.trim() ?? null;
			const releaseYear = idata.first_release_date
				? new Date(idata.first_release_date * 1000).getUTCFullYear()
				: null;
			const genre = idata.genres?.[0]?.name ?? null;

			await db
				.update(games)
				.set({
					coverUrl: coverUrl ?? sg.coverUrl,
					screenshots: screenshots.length ? screenshots : sg.screenshots,
					description: description ?? sg.description,
					releaseYear: releaseYear ?? sg.releaseYear,
					genre: genre ?? sg.genre,
					updatedAt: now,
					lastScrapedAt: now
				})
				.where(and(eq(games.source, 'steam'), eq(games.sourceId, sg.sourceId)));
			enriched++;
		}

		await db
			.update(scrapeJobs)
			.set({
				status: 'success',
				stats: { matched, enriched, skipped, total: steamGames.length },
				finishedAt: now
			})
			.where(sql`${scrapeJobs.id} = ${jobId}`);

		return { matched, enriched, skipped, total: steamGames.length };
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
