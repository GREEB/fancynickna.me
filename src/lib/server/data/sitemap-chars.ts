// Slim accessor for the character sitemap — only loads the precomputed list
// of "interesting" codepoints (~80KB), not the full character table.

import data from '$lib/data/sitemapChars.json';

export function sitemapCharacters(): number[] {
	return data as number[];
}
