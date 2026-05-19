#!/usr/bin/env bun
import 'dotenv/config';
import { scrapeSteam } from '../src/lib/server/scrapers/steam';
import { scrapeUnicode } from '../src/lib/server/scrapers/unicode';

const target = process.argv[2];

async function main() {
	switch (target) {
		case 'steam': {
			const enrich = Number.parseInt(process.argv[3] ?? '0', 10);
			const result = await scrapeSteam({ enrichTop: enrich });
			console.log('steam:', result);
			break;
		}
		case 'unicode': {
			const result = await scrapeUnicode();
			console.log('unicode:', result);
			break;
		}
		case 'all': {
			const a = await scrapeUnicode();
			console.log('unicode:', a);
			const b = await scrapeSteam();
			console.log('steam:', b);
			break;
		}
		default:
			console.error('Usage: bun scripts/scrape.ts <steam|unicode|all> [enrichTop]');
			process.exit(1);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
