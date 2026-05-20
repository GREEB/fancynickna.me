import { sitemapGames } from '$lib/server/data/games';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const rows = sitemapGames();
	const urls = rows
		.map((g) => `<url><loc>${origin}/games/${g.slug}</loc><lastmod>${g.updatedAt}</lastmod></url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9">
${urls}
</urlset>`;
	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
