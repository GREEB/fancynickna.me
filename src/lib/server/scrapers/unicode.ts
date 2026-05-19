import { db } from '../db';
import { characters, unicodeBlocks, scrapeJobs } from '../db/schema';
import { sql } from 'drizzle-orm';
import { fetchWithRetry, slugify } from './util';

const UCD_BASE = 'https://www.unicode.org/Public/UCD/latest/ucd';

interface BlockRow {
	start: number;
	end: number;
	name: string;
	slug: string;
}
interface RangedRow {
	start: number;
	end: number;
	value: string;
}

export async function scrapeUnicode(opts: { includePrivateUse?: boolean } = {}) {
	const includePrivateUse = opts.includePrivateUse ?? false;

	const [{ id: jobId }] = await db
		.insert(scrapeJobs)
		.values({ source: 'unicode', status: 'running' })
		.returning({ id: scrapeJobs.id });

	try {
		const [unicodeData, blocksTxt, scriptsTxt, ageTxt, emojiData] = await Promise.all([
			fetchText(`${UCD_BASE}/UnicodeData.txt`),
			fetchText(`${UCD_BASE}/Blocks.txt`),
			fetchText(`${UCD_BASE}/Scripts.txt`),
			fetchText(`${UCD_BASE}/DerivedAge.txt`),
			fetchText(`${UCD_BASE}/emoji/emoji-data.txt`)
		]);

		const blocks = parseBlocks(blocksTxt);
		const scripts = parseRanged(scriptsTxt);
		const ages = parseRanged(ageTxt);
		const emojiSet = parseEmojiSet(emojiData);

		// Upsert blocks
		for (const b of blocks) {
			await db
				.insert(unicodeBlocks)
				.values({ slug: b.slug, name: b.name, rangeStart: b.start, rangeEnd: b.end })
				.onConflictDoUpdate({
					target: unicodeBlocks.slug,
					set: { name: b.name, rangeStart: b.start, rangeEnd: b.end }
				});
		}

		// Parse UnicodeData.txt (skip range markers; not useful for per-char pages)
		const lines = unicodeData.split('\n');
		const rows: (typeof characters.$inferInsert)[] = [];

		for (const line of lines) {
			if (!line) continue;
			const cols = line.split(';');
			if (cols.length < 15) continue;
			const codepoint = Number.parseInt(cols[0], 16);
			let name = cols[1];
			const category = cols[2];

			if (name.endsWith(', First>') || name.endsWith(', Last>')) continue;
			if (codepoint >= 0xd800 && codepoint <= 0xdfff) continue; // surrogates
			if (!includePrivateUse && category === 'Co') continue;

			// <control> chars get a friendlier label
			if (name === '<control>') name = cols[10] || `Control U+${cols[0]}`;

			const char = String.fromCodePoint(codepoint);
			const block = findRange(blocks, codepoint);
			const script = findRange(scripts, codepoint);
			const age = findRange(ages, codepoint);

			rows.push({
				codepoint,
				char,
				name: name.replace(/^</, '').replace(/>$/, ''),
				altNames: cols[10] ? [cols[10]] : [],
				block: block?.name ?? null,
				blockSlug: block?.slug ?? null,
				category,
				script: script ?? null,
				age: age ?? null,
				htmlEntity: htmlEntity(codepoint, name),
				htmlDec: `&#${codepoint};`,
				htmlHex: `&#x${codepoint.toString(16).toUpperCase()};`,
				cssEscape: `\\${codepoint.toString(16).toUpperCase()}`,
				jsEscape:
					codepoint <= 0xffff
						? `\\u${codepoint.toString(16).toUpperCase().padStart(4, '0')}`
						: `\\u{${codepoint.toString(16).toUpperCase()}}`,
				urlEncoded: encodeURIComponent(char),
				utf8Bytes: toUtf8Hex(char),
				utf16Bytes: toUtf16Hex(char),
				tags: deriveTags(name, category),
				related: [],
				isEmoji: emojiSet.has(codepoint)
			});
		}

		// Bulk upsert in chunks
		let inserted = 0;
		const chunkSize = 1000;
		for (let i = 0; i < rows.length; i += chunkSize) {
			const chunk = rows.slice(i, i + chunkSize);
			await db
				.insert(characters)
				.values(chunk)
				.onConflictDoUpdate({
					target: characters.codepoint,
					set: {
						char: sql`excluded.char`,
						name: sql`excluded.name`,
						block: sql`excluded.block`,
						blockSlug: sql`excluded.block_slug`,
						category: sql`excluded.category`,
						script: sql`excluded.script`,
						age: sql`excluded.age`,
						isEmoji: sql`excluded.is_emoji`,
						updatedAt: new Date()
					}
				});
			inserted += chunk.length;
		}

		await db
			.update(scrapeJobs)
			.set({
				status: 'success',
				stats: { characters: inserted, blocks: blocks.length },
				finishedAt: new Date()
			})
			.where(sql`${scrapeJobs.id} = ${jobId}`);

		return { characters: inserted, blocks: blocks.length };
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

async function fetchText(url: string): Promise<string> {
	const res = await fetchWithRetry(url);
	if (!res.ok) throw new Error(`${url}: ${res.status}`);
	return res.text();
}

function parseBlocks(text: string): BlockRow[] {
	const out: BlockRow[] = [];
	for (const line of text.split('\n')) {
		const t = line.split('#')[0].trim();
		if (!t) continue;
		const m = t.match(/^([0-9A-F]+)\.\.([0-9A-F]+);\s*(.+)$/i);
		if (!m) continue;
		const name = m[3].trim();
		out.push({
			start: parseInt(m[1], 16),
			end: parseInt(m[2], 16),
			name,
			slug: slugify(name)
		});
	}
	return out;
}

function parseRanged(text: string): RangedRow[] {
	const out: RangedRow[] = [];
	for (const line of text.split('\n')) {
		const t = line.split('#')[0].trim();
		if (!t) continue;
		const m = t.match(/^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*(.+)$/i);
		if (!m) continue;
		const start = parseInt(m[1], 16);
		const end = m[2] ? parseInt(m[2], 16) : start;
		out.push({ start, end, value: m[3].trim() });
	}
	return out;
}

function parseEmojiSet(text: string): Set<number> {
	const set = new Set<number>();
	for (const line of text.split('\n')) {
		const t = line.split('#')[0].trim();
		if (!t) continue;
		const m = t.match(/^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*Emoji\s*$/i);
		if (!m) continue;
		const start = parseInt(m[1], 16);
		const end = m[2] ? parseInt(m[2], 16) : start;
		for (let i = start; i <= end; i++) set.add(i);
	}
	return set;
}

function findRange<T extends { start: number; end: number; value?: string; name?: string; slug?: string }>(
	rows: T[],
	cp: number
): T extends BlockRow ? BlockRow | null : string | null {
	// linear is fine; called per-row but rows fit in memory and lists are small
	for (const r of rows) {
		if (cp >= r.start && cp <= r.end) {
			return ('value' in r ? r.value : r) as never;
		}
	}
	return null as never;
}

function htmlEntity(cp: number, name: string): string | null {
	const named: Record<number, string> = {
		0x26: '&amp;', 0x3c: '&lt;', 0x3e: '&gt;', 0x22: '&quot;', 0x27: '&apos;',
		0xa0: '&nbsp;', 0xa9: '&copy;', 0xae: '&reg;', 0x2122: '&trade;',
		0x2665: '&hearts;', 0x2666: '&diams;', 0x2660: '&spades;', 0x2663: '&clubs;'
	};
	return named[cp] ?? null;
}

function toUtf8Hex(s: string): string {
	const enc = new TextEncoder().encode(s);
	return Array.from(enc, (b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

function toUtf16Hex(s: string): string {
	const out: string[] = [];
	for (let i = 0; i < s.length; i++) {
		out.push(s.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase());
	}
	return out.join(' ');
}

function deriveTags(name: string, category: string): string[] {
	const tags = new Set<string>();
	const lc = name.toLowerCase();
	if (/heart/.test(lc)) tags.add('heart');
	if (/star/.test(lc)) tags.add('star');
	if (/arrow/.test(lc)) tags.add('arrow');
	if (/(face|smiling|grinning|tear)/.test(lc)) tags.add('face');
	if (/(flower|rose|tulip|sunflower|cherry blossom)/.test(lc)) tags.add('flower');
	if (/(check|cross|tick|x)/.test(lc)) tags.add('mark');
	if (/(infinity|sum|integral|root|partial|nabla)/.test(lc)) tags.add('math');
	if (category.startsWith('Sc')) tags.add('currency');
	if (category.startsWith('P')) tags.add('punctuation');
	if (category.startsWith('L')) tags.add('letter');
	if (category.startsWith('N')) tags.add('number');
	if (category === 'So') tags.add('symbol');
	return [...tags];
}
