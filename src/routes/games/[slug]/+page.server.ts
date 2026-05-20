import { error } from '@sveltejs/kit';
import { findGameBySlug, relatedGames } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const game = findGameBySlug(params.slug);
	if (!game) throw error(404, 'game not found');
	const related = relatedGames(game, 8);
	return { game, related };
};
