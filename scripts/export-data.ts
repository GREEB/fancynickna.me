#!/usr/bin/env bun
// Dumps the Postgres tables to JSON files in src/lib/data/ so the production
// build can ship without a database. Run this whenever you want to refresh the
// site's data (which, given the project's scope, should be never).

import 'dotenv/config';
import { db } from '../src/lib/server/db';
import { sql } from 'drizzle-orm';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const OUT_DIR = join(import.meta.dir, '..', 'src', 'lib', 'data');

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	console.log('[export] reading games…');
	const games = await db.query.games.findMany({
		orderBy: sql`popularity_score desc, name asc`
	});
	console.log(`[export] ${games.length} games`);

	console.log('[export] reading characters…');
	const characters = await db.query.characters.findMany({
		orderBy: sql`codepoint asc`
	});
	console.log(`[export] ${characters.length} characters`);

	console.log('[export] reading unicode blocks…');
	const blocks = await db.query.unicodeBlocks.findMany({
		orderBy: sql`range_start asc`
	});
	console.log(`[export] ${blocks.length} blocks`);

	// Precompute the "preview char per block" map the /symbols page uses.
	// Match the SSR query: first non-control, non-mark character per block.
	const skipCats = new Set(['Cc', 'Cf', 'Mn', 'Me', 'Mc', 'Zs', 'Zl', 'Zp']);
	const previewByBlock: Record<string, { char: string; codepoint: number }> = {};
	for (const c of characters) {
		if (!c.blockSlug) continue;
		if (previewByBlock[c.blockSlug]) continue;
		if (c.category && skipCats.has(c.category)) continue;
		previewByBlock[c.blockSlug] = { char: c.char, codepoint: c.codepoint };
	}

	// Character sitemap filter — symbols only (So/Sm/Sc/Sk). Previously this
	// also included Letters (Lu/Ll/Lm) and Punctuation (P*), but those buckets
	// add ~5500 codepoints that nobody searches for individually — Latin/Greek/
	// Cyrillic alphabet variants, IPA modifiers, every flavour of quote and
	// dash. Symbols are the SEO target: hearts ♥, stars ★, arrows →, math
	// ∞±÷√, currency $€£¥, emoji ☀☁☂. ~14k → ~8.6k URLs.
	const INTERESTING = new Set(['So', 'Sm', 'Sc', 'Sk']);
	const sitemapChars = characters
		.filter((c) => c.category && INTERESTING.has(c.category))
		.map((c) => c.codepoint);

	const write = async (name: string, data: unknown) => {
		const path = join(OUT_DIR, name);
		const json = JSON.stringify(data);
		await writeFile(path, json);
		console.log(`[export] wrote ${name} (${(json.length / 1024 / 1024).toFixed(2)} MB)`);
	};

	await write('games.json', games);
	await write('characters.json', characters);
	await write('blocks.json', blocks);
	await write('previewByBlock.json', previewByBlock);
	await write('sitemapChars.json', sitemapChars);
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
