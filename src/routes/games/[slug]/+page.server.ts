import { error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq, ne, and, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const game = await db.query.games.findFirst({
		where: eq(schema.games.slug, params.slug)
	});

	if (!game) throw error(404, 'game not found');

	const related = await db.query.games.findMany({
		where: and(ne(schema.games.id, game.id), eq(schema.games.platform, game.platform ?? '')),
		orderBy: sql`popularity_score desc`,
		limit: 8
	});

	return { game, related };
};
