#!/usr/bin/env bun
import 'dotenv/config';
import { scrapeSteam } from '../src/lib/server/scrapers/steam';
import { scrapeUnicode } from '../src/lib/server/scrapers/unicode';
import { scrapeIGDB, scrapeIGDBCurated } from '../src/lib/server/scrapers/igdb';

const target = process.argv[2];

async function main() {
	switch (target) {
		case 'steam': {
			// Args: <startPage> <maxPages> [enrichTop]
			const startPage = Number.parseInt(process.argv[3] ?? '0', 10);
			const maxPages = Number.parseInt(process.argv[4] ?? '3', 10);
			const enrich = Number.parseInt(process.argv[5] ?? '0', 10);
			const result = await scrapeSteam({ startPage, maxPages, enrichTop: enrich });
			console.log('steam:', result);
			break;
		}
		case 'unicode': {
			const result = await scrapeUnicode();
			console.log('unicode:', result);
			break;
		}
		case 'igdb': {
			const topN = Number.parseInt(process.argv[3] ?? '200', 10);
			const result = await scrapeIGDB({ topN });
			console.log('igdb:', result);
			break;
		}
		case 'igdb-curated': {
			const result = await scrapeIGDBCurated();
			console.log('igdb-curated:', result);
			break;
		}
		case 'all': {
			const a = await scrapeUnicode();
			console.log('unicode:', a);
			const b = await scrapeSteam();
			console.log('steam:', b);
			const c = await scrapeIGDB({ topN: 200 });
			console.log('igdb:', c);
			break;
		}
		default:
			console.error('Usage: bun scripts/scrape.ts <steam|unicode|igdb|all> [arg]');
			process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
