import { db } from '../db';
import { games, scrapeJobs } from '../db/schema';
import { sql } from 'drizzle-orm';
import { fetchWithRetry, slugify, sleep } from './util';

interface SteamApp {
	appid: number;
	name: string;
}

const APP_LIST_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/';
const APP_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';

export async function scrapeSteam(opts: { enrichTop?: number; throttleMs?: number } = {}) {
	const enrichTop = opts.enrichTop ?? 0;
	const throttleMs = opts.throttleMs ?? 1500;

	const [{ id: jobId }] = await db
		.insert(scrapeJobs)
		.values({ source: 'steam', status: 'running' })
		.returning({ id: scrapeJobs.id });

	let inserted = 0;
	let updated = 0;
	let enriched = 0;

	try {
		const res = await fetchWithRetry(APP_LIST_URL);
		const json = (await res.json()) as { applist: { apps: SteamApp[] } };
		const apps = json.applist.apps.filter((a) => a.name && a.name.trim().length > 0);

		// Bulk upsert in chunks
		const chunkSize = 500;
		for (let i = 0; i < apps.length; i += chunkSize) {
			const chunk = apps.slice(i, i + chunkSize);
			const rows = chunk.map((a) => ({
				slug: slugify(a.name) || `steam-${a.appid}`,
				name: a.name,
				platform: 'pc',
				source: 'steam',
				sourceId: String(a.appid),
				lastScrapedAt: new Date()
			}));

			const result = await db
				.insert(games)
				.values(rows)
				.onConflictDoUpdate({
					target: [games.source, games.sourceId],
					set: {
						name: sql`excluded.name`,
						lastScrapedAt: sql`excluded.last_scraped_at`,
						updatedAt: new Date()
					}
				})
				.returning({ id: games.id });
			inserted += result.length;
		}

		// Optionally enrich top N with appdetails
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
				stats: { inserted, updated, enriched, total: apps.length },
				finishedAt: new Date()
			})
			.where(sql`${scrapeJobs.id} = ${jobId}`);

		return { inserted, updated, enriched, total: apps.length };
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
