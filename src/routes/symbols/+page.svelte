<script lang="ts">
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	let { data } = $props();

	// 346 blocks is a lot of cards to paint at once — lazy-render in batches as
	// the user scrolls. IntersectionObserver fires when the sentinel near the
	// bottom of the visible list enters the viewport (with a generous rootMargin
	// so the next batch is ready before the user actually hits the end).
	const BATCH = 80;
	let visible = $state(Math.min(BATCH, data.blocks.length));
	let sentinel = $state<HTMLDivElement | undefined>();

	const visibleBlocks = $derived(data.blocks.slice(0, visible));

	onMount(() => {
		if (!sentinel || visible >= data.blocks.length) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					visible = Math.min(visible + BATCH, data.blocks.length);
				}
			},
			{ rootMargin: '600px' }
		);
		io.observe(sentinel);
		return () => io.disconnect();
	});
</script>

<svelte:head>
	<title>Unicode Symbols & Characters | fancynickna.me</title>
	<meta
		name="description"
		content="Browse every Unicode symbol organized by block — hearts, arrows, math, currency, emoji, runic and more. Click any character to copy it, or see its full encoding info."
	/>
	<link rel="canonical" href="https://fancynickna.me/symbols" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/symbols" />
	<meta property="og:title" content="Unicode Symbols & Characters | fancynickna.me" />
	<meta
		property="og:description"
		content="Browse every Unicode symbol by block — hearts, arrows, math, currency, emoji. Click to copy."
	/>
	<meta property="og:image" content="https://fancynickna.me/og.png?title=Every+Symbol&subtitle=Browse+Unicode+by+block.+Hearts%2C+arrows%2C+math." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Unicode Symbols & Characters | fancynickna.me" />
	<meta name="twitter:description" content="Every Unicode symbol, organized by block." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=Every+Symbol" />
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px);">
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			every symbol.
		</h1>
		<p style="color: var(--fg-soft); max-width: 720px; font-family: var(--font-sans); font-size: 17px; line-height: 1.55;">
			Unicode is the world's character catalog — over a hundred thousand letters, digits, punctuation
			marks, math operators, dingbats, currency signs, kaomoji components, and emoji. This page
			organizes them by <strong>block</strong>: the named ranges Unicode itself uses, like
			<em>Mathematical Operators</em>, <em>Arrows</em>, <em>Greek and Coptic</em> or
			<em>Latin Extended-A</em>. Click a block to see every character inside it, hover any
			character to copy it.
		</p>
		<p style="color: var(--fg-soft); max-width: 720px; margin-top: 8px;">
			browse Unicode by block. {data.blocks.length} blocks, hundreds of thousands of characters.
		</p>
	</section>

	<section style="padding: 0 clamp(20px, 4vw, 56px) 80px;">
		<div
			style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));"
		>
			{#each visibleBlocks as b (b.id)}
				{@const preview = data.previewByBlock[b.slug]}
				<a
					href={`/symbols/block/${b.slug}`}
					class="block-card"
					style="display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 12px; align-items: center; border: 1px solid var(--line); border-radius: 14px; padding: 10px 14px; text-decoration: none; color: var(--fg); background: var(--card);"
				>
					<div
						style="display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 10px; background: var(--bg); border: 1px solid var(--line); font-family: serif; font-size: 26px; line-height: 1; overflow: hidden;"
						aria-hidden="true"
					>
						{preview?.char ?? '·'}
					</div>
					<div style="min-width: 0;">
						<div style="font-size: 14px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis;">
							{b.name}
						</div>
						<div style="font-family: var(--font-mono); font-size: 11px; color: var(--fg-soft); margin-top: 2px;">
							U+{b.rangeStart.toString(16).toUpperCase()}–U+{b.rangeEnd.toString(16).toUpperCase()}
						</div>
					</div>
				</a>
			{/each}
		</div>
		{#if visible < data.blocks.length}
			<div
				bind:this={sentinel}
				style="margin-top: 32px; text-align: center; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-soft);"
			>
				loading {data.blocks.length - visible} more blocks…
			</div>
		{/if}
	</section>

	<SiteFooter />
</main>

<style>
	.block-card {
		transition: transform 80ms ease, box-shadow 80ms ease, border-color 80ms ease;
	}
	.block-card:hover {
		transform: translate(-1px, -1px);
		border-color: var(--fg);
		box-shadow: 3px 3px 0 var(--accent), 3px 3px 0 1px var(--fg);
	}
</style>
