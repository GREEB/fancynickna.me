import { error } from '@sveltejs/kit';
import { findBlock, charactersInBlock } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const block = findBlock(params.slug);
	if (!block) throw error(404, 'block not found');
	const chars = charactersInBlock(block.slug, 1000);
	return { block, chars };
};
