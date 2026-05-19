import { db, schema } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10));
	const perPage = 60;
	const offset = (page - 1) * perPage;

	const rows = await db.query.games.findMany({
		where: q
			? sql`(${schema.games.name} ILIKE ${'%' + q + '%'} OR ${schema.games.aliases}::text ILIKE ${'%' + q + '%'})`
			: undefined,
		orderBy: sql`popularity_score desc, name asc`,
		limit: perPage,
		offset
	});

	return { games: rows, q, page };
};
