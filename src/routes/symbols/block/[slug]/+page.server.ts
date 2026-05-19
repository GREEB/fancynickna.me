import { error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const block = await db.query.unicodeBlocks.findFirst({
		where: eq(schema.unicodeBlocks.slug, params.slug)
	});
	if (!block) throw error(404, 'block not found');

	const chars = await db.query.characters.findMany({
		where: eq(schema.characters.blockSlug, block.slug),
		orderBy: sql`codepoint asc`,
		limit: 1000
	});

	return { block, chars };
};
