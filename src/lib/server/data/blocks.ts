// Unicode-blocks accessor. Loads only blocks.json (50KB) and the precomputed
// previewByBlock.json (10KB) — never the full 19MB characters list.

import blocksData from '$lib/data/blocks.json';
import previewData from '$lib/data/previewByBlock.json';

export interface UnicodeBlock {
	id: number;
	slug: string;
	name: string;
	rangeStart: number;
	rangeEnd: number;
}

const blocks = blocksData as unknown as UnicodeBlock[];
const previewByBlock = previewData as Record<string, { char: string; codepoint: number }>;

let _bySlug: Map<string, UnicodeBlock> | null = null;
function bySlug(): Map<string, UnicodeBlock> {
	if (!_bySlug) _bySlug = new Map(blocks.map((b) => [b.slug, b]));
	return _bySlug;
}

export function findBlock(slug: string): UnicodeBlock | undefined {
	return bySlug().get(slug);
}

export function listBlocks(): UnicodeBlock[] {
	return blocks;
}

export function getPreviewByBlock(): Record<string, { char: string; codepoint: number }> {
	return previewByBlock;
}
