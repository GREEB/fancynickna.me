import { db, schema } from '$lib/server/db';
import { sql, inArray, isNotNull, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Limit to "interesting" categories to stay within the 50k URL/sitemap cap.
// (CJK ideographs alone are >90k chars and not target keywords.)
const INTERESTING = ['So', 'Sm', 'Sc', 'Sk', 'Lm', 'Ll', 'Lu', 'Po', 'Pd', 'Ps', 'Pe', 'Pi', 'Pf'];

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const rows = await db.query.characters.findMany({
		columns: { codepoint: true },
		where: and(isNotNull(schema.characters.category), inArray(schema.characters.category, INTERESTING)),
		orderBy: sql`codepoint asc`,
		limit: 50000
	});

	const urls = rows
		.map((c) => `<url><loc>${origin}/c/${c.codepoint.toString(16)}</loc></url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9">
${urls}
</urlset>`;
	return new Response(xml, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
