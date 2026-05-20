import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/0.9 http://www.sitemaps.org/schemas/0.9/siteindex.xsd">
	<sitemap><loc>${origin}/sitemap-static.xml</loc></sitemap>
	<sitemap><loc>${origin}/sitemap-games.xml</loc></sitemap>
	<sitemap><loc>${origin}/sitemap-characters.xml</loc></sitemap>
</sitemapindex>`;

	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' }
	});
};
