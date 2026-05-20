import { pgTable, serial, text, integer, timestamp, boolean, jsonb, index, uniqueIndex, real } from 'drizzle-orm/pg-core';

export const games = pgTable(
	'games',
	{
		id: serial('id').primaryKey(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		aliases: jsonb('aliases').$type<string[]>().default([]).notNull(),
		platform: text('platform'),
		source: text('source').notNull(),
		sourceId: text('source_id').notNull(),
		iconUrl: text('icon_url'),
		coverUrl: text('cover_url'),
		description: text('description'),
		genre: text('genre'),
		releaseYear: integer('release_year'),
		minNameLen: integer('min_name_len'),
		maxNameLen: integer('max_name_len'),
		allowedCharsRegex: text('allowed_chars_regex'),
		bannedWords: jsonb('banned_words').$type<string[]>().default([]).notNull(),
		screenshots: jsonb('screenshots').$type<string[]>().default([]).notNull(),
		popularityScore: real('popularity_score').default(0).notNull(),
		curated: boolean('curated').default(false).notNull(),
		lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [
		uniqueIndex('games_source_idx').on(t.source, t.sourceId),
		index('games_popularity_idx').on(t.popularityScore),
		index('games_name_idx').on(t.name)
	]
);

export const gameAliases = pgTable('game_aliases', {
	id: serial('id').primaryKey(),
	gameId: integer('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	alias: text('alias').notNull()
});

export const characters = pgTable(
	'characters',
	{
		codepoint: integer('codepoint').primaryKey(),
		char: text('char').notNull(),
		name: text('name').notNull(),
		altNames: jsonb('alt_names').$type<string[]>().default([]).notNull(),
		block: text('block'),
		blockSlug: text('block_slug'),
		category: text('category'),
		script: text('script'),
		age: text('age'),
		htmlEntity: text('html_entity'),
		htmlDec: text('html_dec'),
		htmlHex: text('html_hex'),
		cssEscape: text('css_escape'),
		jsEscape: text('js_escape'),
		urlEncoded: text('url_encoded'),
		utf8Bytes: text('utf8_bytes'),
		utf16Bytes: text('utf16_bytes'),
		tags: jsonb('tags').$type<string[]>().default([]).notNull(),
		related: jsonb('related').$type<number[]>().default([]).notNull(),
		isEmoji: boolean('is_emoji').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [
		index('chars_block_idx').on(t.blockSlug),
		index('chars_category_idx').on(t.category),
		index('chars_script_idx').on(t.script),
		index('chars_name_idx').on(t.name)
	]
);

export const unicodeBlocks = pgTable('unicode_blocks', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	rangeStart: integer('range_start').notNull(),
	rangeEnd: integer('range_end').notNull()
});

export const nicknameStyles = pgTable('nickname_styles', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	transformerKey: text('transformer_key').notNull(),
	sampleIn: text('sample_in').default('YourName').notNull(),
	sampleOut: text('sample_out').notNull()
});

export const savedNicknames = pgTable(
	'saved_nicknames',
	{
		id: serial('id').primaryKey(),
		shareId: text('share_id').notNull().unique(),
		content: text('content').notNull(),
		styleSlug: text('style_slug'),
		gameSlug: text('game_slug'),
		views: integer('views').default(0).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index('saved_share_idx').on(t.shareId)]
);

export const scrapeJobs = pgTable('scrape_jobs', {
	id: serial('id').primaryKey(),
	source: text('source').notNull(),
	status: text('status').notNull(),
	stats: jsonb('stats').$type<Record<string, unknown>>().default({}).notNull(),
	error: text('error'),
	startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
	finishedAt: timestamp('finished_at', { withTimezone: true })
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
