import { error, redirect } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq, and, gte, lte, ne, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const raw = params.code.toLowerCase().replace(/^u\+?/, '');
	const cp = Number.parseInt(raw, 16);
	if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) throw error(404, 'invalid codepoint');

	// Canonicalize the URL to lowercase hex with no leading zeros (`/c/2665`)
	const canonical = cp.toString(16);
	if (params.code !== canonical) throw redirect(301, `/c/${canonical}`);

	const char = await db.query.characters.findFirst({
		where: eq(schema.characters.codepoint, cp)
	});

	if (!char) throw error(404, 'character not found');

	// Sibling chars in the same block
	const siblings = char.blockSlug
		? await db.query.characters.findMany({
				where: and(
					eq(schema.characters.blockSlug, char.blockSlug),
					ne(schema.characters.codepoint, cp),
					gte(schema.characters.codepoint, cp - 12),
					lte(schema.characters.codepoint, cp + 12)
				),
				orderBy: sql`codepoint asc`,
				limit: 24
			})
		: [];

	return { char, siblings };
};
