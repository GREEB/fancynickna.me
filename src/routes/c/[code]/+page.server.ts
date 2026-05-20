import { error, redirect } from '@sveltejs/kit';
import { findCharacter, siblingCharacters } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const raw = params.code.toLowerCase().replace(/^u\+?/, '');
	const cp = Number.parseInt(raw, 16);
	if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) throw error(404, 'invalid codepoint');

	// Canonicalize the URL to lowercase hex with no leading zeros (`/c/2665`)
	const canonical = cp.toString(16);
	if (params.code !== canonical) throw redirect(301, `/c/${canonical}`);

	const char = findCharacter(cp);
	if (!char) throw error(404, 'character not found');

	const siblings = siblingCharacters(char, 12, 24);
	return { char, siblings };
};
