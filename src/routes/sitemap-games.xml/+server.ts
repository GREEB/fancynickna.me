import { db, schema } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const rows = await db.query.games.findMany({
		columns: { slug: true, updatedAt: true },
		orderBy: sql`popularity_score desc`,
		limit: 50000
	});

	const urls = rows
		.map(
			(g) =>
				`<url><loc>${origin}/games/${g.slug}</loc><lastmod>${g.updatedAt.toISOString()}</lastmod></url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9">
${urls}
</urlset>`;
	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
