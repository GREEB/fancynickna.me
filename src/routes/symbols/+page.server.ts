import { db, schema } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const blocks = await db.query.unicodeBlocks.findMany({
		orderBy: sql`range_start asc`
	});
	return { blocks };
};
