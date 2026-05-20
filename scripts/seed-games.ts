#!/usr/bin/env bun
import 'dotenv/config';
import { db } from '../src/lib/server/db';
import { games } from '../src/lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { slugify } from '../src/lib/server/scrapers/util';

// Hand-curated top-traffic games with verified name rules.
// `popularityScore` is a rough ordering signal so the index sorts these to the top.
const seed: {
	name: string;
	aliases?: string[];
	platform: string;
	genre?: string;
	minNameLen?: number;
	maxNameLen?: number;
	allowedCharsRegex?: string;
	popularityScore: number;
}[] = [
	{ name: 'Fortnite', platform: 'multi', genre: 'battle royale', minNameLen: 3, maxNameLen: 16, popularityScore: 100 },
	{ name: 'Valorant', platform: 'pc', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 98 },
	{ name: 'Free Fire', aliases: ['garena free fire', 'ff'], platform: 'mobile', genre: 'battle royale', minNameLen: 4, maxNameLen: 14, popularityScore: 97 },
	{ name: 'PUBG Mobile', aliases: ['pubgm'], platform: 'mobile', genre: 'battle royale', minNameLen: 4, maxNameLen: 14, popularityScore: 96 },
	{ name: 'PUBG: Battlegrounds', aliases: ['pubg'], platform: 'pc', genre: 'battle royale', minNameLen: 3, maxNameLen: 16, popularityScore: 95 },
	{ name: 'Mobile Legends: Bang Bang', aliases: ['mlbb', 'ml'], platform: 'mobile', genre: 'moba', minNameLen: 4, maxNameLen: 16, popularityScore: 94 },
	{ name: 'Call of Duty: Mobile', aliases: ['cod mobile', 'codm'], platform: 'mobile', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 93 },
	{ name: 'Call of Duty: Warzone', aliases: ['warzone'], platform: 'pc', genre: 'battle royale', minNameLen: 3, maxNameLen: 16, popularityScore: 92 },
	{ name: 'League of Legends', aliases: ['lol'], platform: 'pc', genre: 'moba', minNameLen: 3, maxNameLen: 16, popularityScore: 91 },
	{ name: 'Minecraft', platform: 'multi', genre: 'sandbox', minNameLen: 3, maxNameLen: 16, allowedCharsRegex: '^[A-Za-z0-9_]+$', popularityScore: 90 },
	{ name: 'Roblox', platform: 'multi', genre: 'sandbox', minNameLen: 3, maxNameLen: 20, allowedCharsRegex: '^[A-Za-z0-9_]+$', popularityScore: 89 },
	{ name: 'Genshin Impact', platform: 'multi', genre: 'rpg', minNameLen: 1, maxNameLen: 14, popularityScore: 88 },
	{ name: 'Honkai: Star Rail', platform: 'multi', genre: 'rpg', minNameLen: 1, maxNameLen: 16, popularityScore: 87 },
	{ name: 'Wuthering Waves', platform: 'multi', genre: 'rpg', minNameLen: 1, maxNameLen: 16, popularityScore: 86 },
	{ name: 'Apex Legends', platform: 'multi', genre: 'battle royale', minNameLen: 3, maxNameLen: 16, popularityScore: 85 },
	{ name: 'Counter-Strike 2', aliases: ['cs2', 'cs'], platform: 'pc', genre: 'fps', minNameLen: 1, maxNameLen: 32, popularityScore: 84 },
	{ name: 'Dota 2', platform: 'pc', genre: 'moba', minNameLen: 3, maxNameLen: 32, popularityScore: 83 },
	{ name: 'Overwatch 2', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 12, popularityScore: 82 },
	{ name: 'Rainbow Six Siege', aliases: ['r6'], platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 15, popularityScore: 81 },
	{ name: 'Among Us', platform: 'multi', genre: 'social', minNameLen: 1, maxNameLen: 10, popularityScore: 80 },
	{ name: 'Brawl Stars', platform: 'mobile', genre: 'arena', minNameLen: 3, maxNameLen: 15, popularityScore: 79 },
	{ name: 'Clash Royale', platform: 'mobile', genre: 'strategy', minNameLen: 3, maxNameLen: 15, popularityScore: 78 },
	{ name: 'Clash of Clans', platform: 'mobile', genre: 'strategy', minNameLen: 3, maxNameLen: 15, popularityScore: 77 },
	{ name: 'GTA Online', aliases: ['gta v', 'gta 5', 'grand theft auto v', 'grand theft auto online'], platform: 'multi', genre: 'open-world', minNameLen: 3, maxNameLen: 16, popularityScore: 76 },
	{ name: 'Rocket League', platform: 'multi', genre: 'sports', minNameLen: 3, maxNameLen: 20, popularityScore: 75 },
	{ name: 'EA Sports FC 25', aliases: ['fifa', 'fc 25'], platform: 'multi', genre: 'sports', minNameLen: 3, maxNameLen: 16, popularityScore: 74 },
	{ name: 'World of Warcraft', aliases: ['wow'], platform: 'pc', genre: 'mmo', minNameLen: 2, maxNameLen: 12, popularityScore: 73 },
	{ name: 'Final Fantasy XIV', aliases: ['ffxiv', 'ff14'], platform: 'multi', genre: 'mmo', minNameLen: 2, maxNameLen: 20, popularityScore: 72 },
	{ name: 'New World', platform: 'pc', genre: 'mmo', minNameLen: 3, maxNameLen: 20, popularityScore: 71 },
	{ name: 'Lost Ark', platform: 'pc', genre: 'mmo', minNameLen: 2, maxNameLen: 16, popularityScore: 70 },
	{ name: 'Path of Exile', aliases: ['poe'], platform: 'multi', genre: 'arpg', minNameLen: 3, maxNameLen: 24, popularityScore: 69 },
	{ name: 'Diablo IV', aliases: ['diablo 4'], platform: 'multi', genre: 'arpg', minNameLen: 2, maxNameLen: 12, popularityScore: 68 },
	{ name: 'Elden Ring', platform: 'multi', genre: 'rpg', minNameLen: 1, maxNameLen: 16, popularityScore: 67 },
	{ name: 'Helldivers 2', platform: 'multi', genre: 'shooter', minNameLen: 3, maxNameLen: 20, popularityScore: 66 },
	{ name: 'Marvel Rivals', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 65 },
	{ name: 'Fall Guys', platform: 'multi', genre: 'party', minNameLen: 3, maxNameLen: 16, popularityScore: 64 },
	{ name: 'Stumble Guys', platform: 'mobile', genre: 'party', minNameLen: 3, maxNameLen: 16, popularityScore: 63 },
	{ name: 'Bedwars', platform: 'multi', genre: 'pvp', popularityScore: 62 },
	{ name: 'Naraka: Bladepoint', platform: 'multi', genre: 'battle royale', minNameLen: 3, maxNameLen: 16, popularityScore: 61 },
	{ name: 'The Finals', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 60 },
	{ name: 'XDefiant', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 59 },
	{ name: 'War Thunder', platform: 'multi', genre: 'vehicle', minNameLen: 3, maxNameLen: 16, popularityScore: 58 },
	{ name: 'World of Tanks', platform: 'multi', genre: 'vehicle', minNameLen: 3, maxNameLen: 24, popularityScore: 57 },
	{ name: 'Smite', platform: 'multi', genre: 'moba', minNameLen: 3, maxNameLen: 25, popularityScore: 56 },
	{ name: 'Splitgate 2', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 55 },
	{ name: 'Sea of Thieves', platform: 'multi', genre: 'adventure', minNameLen: 3, maxNameLen: 16, popularityScore: 54 },
	{ name: 'Destiny 2', platform: 'multi', genre: 'looter shooter', minNameLen: 3, maxNameLen: 16, popularityScore: 53 },
	{ name: 'Halo Infinite', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 15, popularityScore: 52 },
	{ name: 'Splitgate', platform: 'multi', genre: 'fps', minNameLen: 3, maxNameLen: 16, popularityScore: 51 },
	{ name: 'Discord', platform: 'social', genre: 'chat', minNameLen: 2, maxNameLen: 32, allowedCharsRegex: '^[a-z0-9._]+$', popularityScore: 50 },
	{ name: 'TikTok', platform: 'social', genre: 'social', minNameLen: 2, maxNameLen: 24, allowedCharsRegex: '^[A-Za-z0-9._]+$', popularityScore: 49 },
	{ name: 'Instagram', platform: 'social', genre: 'social', minNameLen: 1, maxNameLen: 30, allowedCharsRegex: '^[A-Za-z0-9._]+$', popularityScore: 48 },
	{ name: 'Twitch', platform: 'social', genre: 'streaming', minNameLen: 4, maxNameLen: 25, allowedCharsRegex: '^[A-Za-z0-9_]+$', popularityScore: 47 }
];

async function main() {
	for (const g of seed) {
		const slug = slugify(g.name);
		await db
			.insert(games)
			.values({
				slug,
				name: g.name,
				aliases: g.aliases ?? [],
				platform: g.platform,
				source: 'curated',
				sourceId: slug,
				genre: g.genre ?? null,
				minNameLen: g.minNameLen ?? null,
				maxNameLen: g.maxNameLen ?? null,
				allowedCharsRegex: g.allowedCharsRegex ?? null,
				popularityScore: g.popularityScore,
				curated: true
			})
			.onConflictDoUpdate({
				target: [games.source, games.sourceId],
				set: {
					name: sql`excluded.name`,
					aliases: sql`excluded.aliases`,
					platform: sql`excluded.platform`,
					genre: sql`excluded.genre`,
					minNameLen: sql`excluded.min_name_len`,
					maxNameLen: sql`excluded.max_name_len`,
					allowedCharsRegex: sql`excluded.allowed_chars_regex`,
					popularityScore: sql`excluded.popularity_score`,
					curated: true,
					updatedAt: new Date()
				}
			});
	}
	console.log(`seeded ${seed.length} curated games`);
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
