import { listBlocks, getPreviewByBlock } from '$lib/server/data/blocks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		blocks: listBlocks(),
		previewByBlock: getPreviewByBlock()
	};
};
