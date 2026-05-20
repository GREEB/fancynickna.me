import { searchGames } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10));
	const perPage = 60;
	const offset = (page - 1) * perPage;
	const games = searchGames({ q, limit: perPage, offset });
	return { games, q, page };
};
