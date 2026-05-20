import { sitemapCharacters } from '$lib/server/data/sitemap-chars';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const codepoints = sitemapCharacters();
	const urls = codepoints
		.map((cp) => `<url><loc>${origin}/c/${cp.toString(16)}</loc></url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/0.9 http://www.sitemaps.org/schemas/0.9/sitemap.xsd">
${urls}
</urlset>`;
	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
