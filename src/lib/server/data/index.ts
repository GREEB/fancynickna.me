// JSON-backed data accessor — replaces the Postgres/Drizzle layer for production.
// All four JSON blobs are bundled into the SvelteKit server build by Vite (the
// `import games from './games.json'` is a static import resolved at build time),
// so cold-start cost is parsing time, not network/disk I/O. After the first call
// to each loader, results live in `module-level` constants for the lifetime of
// the function instance.
//
// The Postgres database remains the source of truth for scraper runs only;
// `scripts/export-data.ts` dumps it to `src/lib/data/*.json`. Re-run that script
// any time you want to refresh production data.

import gamesData from '$lib/data/games.json';
import charactersData from '$lib/data/characters.json';
import blocksData from '$lib/data/blocks.json';
import previewByBlockData from '$lib/data/previewByBlock.json';
import sitemapCharsData from '$lib/data/sitemapChars.json';

// =============================================================================
// Types — mirror the Drizzle schema shapes, but timestamps are ISO strings
// after JSON serialization.
// =============================================================================
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

export interface Character {
	codepoint: number;
	char: string;
	name: string;
	altNames: string[];
	block: string | null;
	blockSlug: string | null;
	category: string | null;
	script: string | null;
	age: string | null;
	htmlEntity: string | null;
	htmlDec: string | null;
	htmlHex: string | null;
	cssEscape: string | null;
	jsEscape: string | null;
	urlEncoded: string | null;
	utf8Bytes: string | null;
	utf16Bytes: string | null;
	tags: string[];
	related: number[];
	isEmoji: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UnicodeBlock {
	id: number;
	slug: string;
	name: string;
	rangeStart: number;
	rangeEnd: number;
}

// =============================================================================
// Indexes — built lazily on first read so they don't pay cost during cold start
// for routes that don't need them.
// =============================================================================
const games = gamesData as unknown as Game[];
const characters = charactersData as unknown as Character[];
const blocks = blocksData as unknown as UnicodeBlock[];
const previewByBlock = previewByBlockData as Record<string, { char: string; codepoint: number }>;
const sitemapChars = sitemapCharsData as number[];

let _gameBySlug: Map<string, Game> | null = null;
function gameBySlug(): Map<string, Game> {
	if (!_gameBySlug) _gameBySlug = new Map(games.map((g) => [g.slug, g]));
	return _gameBySlug;
}

let _gameById: Map<number, Game> | null = null;
function gameById(): Map<number, Game> {
	if (!_gameById) _gameById = new Map(games.map((g) => [g.id, g]));
	return _gameById;
}

let _charByCp: Map<number, Character> | null = null;
function charByCp(): Map<number, Character> {
	if (!_charByCp) _charByCp = new Map(characters.map((c) => [c.codepoint, c]));
	return _charByCp;
}

let _blockBySlug: Map<string, UnicodeBlock> | null = null;
function blockBySlug(): Map<string, UnicodeBlock> {
	if (!_blockBySlug) _blockBySlug = new Map(blocks.map((b) => [b.slug, b]));
	return _blockBySlug;
}

let _charsByBlock: Map<string, Character[]> | null = null;
function charsByBlock(): Map<string, Character[]> {
	if (!_charsByBlock) {
		const m = new Map<string, Character[]>();
		for (const c of characters) {
			if (!c.blockSlug) continue;
			let arr = m.get(c.blockSlug);
			if (!arr) {
				arr = [];
				m.set(c.blockSlug, arr);
			}
			arr.push(c);
		}
		_charsByBlock = m;
	}
	return _charsByBlock;
}

// =============================================================================
// Public API — narrow set of helpers each route uses.
// =============================================================================
export function findGameBySlug(slug: string): Game | undefined {
	return gameBySlug().get(slug);
}

export function findGameById(id: number): Game | undefined {
	return gameById().get(id);
}

export function searchGames(opts: {
	q?: string;
	limit?: number;
	offset?: number;
}): Game[] {
	const { q = '', limit = 60, offset = 0 } = opts;
	const needle = q.trim().toLowerCase();
	const filtered = needle
		? games.filter(
				(g) =>
					g.name.toLowerCase().includes(needle) ||
					g.aliases?.some((a) => a.toLowerCase().includes(needle))
			)
		: games;
	// games[] is already sorted by popularity_score desc, name asc from the export
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

export function findCharacter(codepoint: number): Character | undefined {
	return charByCp().get(codepoint);
}

export function siblingCharacters(char: Character, range = 12, limit = 24): Character[] {
	if (!char.blockSlug) return [];
	const cp = char.codepoint;
	const all = charsByBlock().get(char.blockSlug) ?? [];
	return all
		.filter((c) => c.codepoint !== cp && c.codepoint >= cp - range && c.codepoint <= cp + range)
		.sort((a, b) => a.codepoint - b.codepoint)
		.slice(0, limit);
}

export function findBlock(slug: string): UnicodeBlock | undefined {
	return blockBySlug().get(slug);
}

export function listBlocks(): UnicodeBlock[] {
	// Already sorted by rangeStart asc from the export
	return blocks;
}

export function charactersInBlock(blockSlug: string, limit = 1000): Character[] {
	const arr = charsByBlock().get(blockSlug) ?? [];
	// Already grouped in original (codepoint asc) order from the export
	return arr.slice(0, limit);
}

export function getPreviewByBlock(): Record<string, { char: string; codepoint: number }> {
	return previewByBlock;
}

export function sitemapGames(): { slug: string; updatedAt: string }[] {
	return games.map((g) => ({ slug: g.slug, updatedAt: g.updatedAt }));
}

export function sitemapCharacters(): number[] {
	return sitemapChars;
}
