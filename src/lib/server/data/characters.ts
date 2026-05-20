// Character-data accessor. Loads characters.json (~19MB) — only routes that
// actually need per-character data should import from here. The character
// sitemap pulls from sitemapChars.json (small, precomputed) — import that
// instead via `./sitemap-chars`.

import charactersData from '$lib/data/characters.json';

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

const characters = charactersData as unknown as Character[];

let _byCp: Map<number, Character> | null = null;
function byCp(): Map<number, Character> {
	if (!_byCp) _byCp = new Map(characters.map((c) => [c.codepoint, c]));
	return _byCp;
}

let _byBlock: Map<string, Character[]> | null = null;
function byBlock(): Map<string, Character[]> {
	if (!_byBlock) {
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
		_byBlock = m;
	}
	return _byBlock;
}

export function findCharacter(codepoint: number): Character | undefined {
	return byCp().get(codepoint);
}

export function siblingCharacters(char: Character, range = 12, limit = 24): Character[] {
	if (!char.blockSlug) return [];
	const cp = char.codepoint;
	const all = byBlock().get(char.blockSlug) ?? [];
	return all
		.filter((c) => c.codepoint !== cp && c.codepoint >= cp - range && c.codepoint <= cp + range)
		.sort((a, b) => a.codepoint - b.codepoint)
		.slice(0, limit);
}

export function charactersInBlock(blockSlug: string, limit = 1000): Character[] {
	const arr = byBlock().get(blockSlug) ?? [];
	return arr.slice(0, limit);
}
