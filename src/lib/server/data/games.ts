// Games-only data accessor. Importing this file only pulls in games.json
// (~6.5MB), not characters.json. Routes that need character data should import
// from `./characters`; routes that need just block listings from `./blocks`.

import gamesData from '$lib/data/games.json';

export interface Game {
	id: number;
	slug: string;
	name: string;
	aliases: string[];
	platform: string | null;
	source: string;
	sourceId: string;
	iconUrl: string | null;
	coverUrl: string | null;
	description: string | null;
	genre: string | null;
	releaseYear: number | null;
	minNameLen: number | null;
	maxNameLen: number | null;
	allowedCharsRegex: string | null;
	bannedWords: string[];
	screenshots: string[];
	popularityScore: number;
	curated: boolean;
	lastScrapedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

const games = gamesData as unknown as Game[];

let _bySlug: Map<string, Game> | null = null;
function bySlug(): Map<string, Game> {
	if (!_bySlug) _bySlug = new Map(games.map((g) => [g.slug, g]));
	return _bySlug;
}

export function findGameBySlug(slug: string): Game | undefined {
	return bySlug().get(slug);
}

export function searchGames(opts: { q?: string; limit?: number; offset?: number }): Game[] {
	const { q = '', limit = 60, offset = 0 } = opts;
	const needle = q.trim().toLowerCase();
	const filtered = needle
		? games.filter(
				(g) =>
					g.name.toLowerCase().includes(needle) ||
					g.aliases?.some((a) => a.toLowerCase().includes(needle))
			)
		: games;
	return filtered.slice(offset, offset + limit);
}

export function relatedGames(game: Game, limit = 8): Game[] {
	const out: Game[] = [];
	for (const g of games) {
		if (g.id === game.id) continue;
		if ((g.platform ?? '') !== (game.platform ?? '')) continue;
		out.push(g);
		if (out.length >= limit) break;
	}
	return out;
}

export function sitemapGames(): { slug: string; updatedAt: string }[] {
	return games.map((g) => ({ slug: g.slug, updatedAt: g.updatedAt }));
}
