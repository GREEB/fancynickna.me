<script lang="ts">
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	let { data } = $props();
	const { block, chars } = data;
	const title = `${block.name} — Unicode block · fancynickna.me`;
	const description = `Every character in the ${block.name} Unicode block. U+${block.rangeStart.toString(16).toUpperCase()} to U+${block.rangeEnd.toString(16).toUpperCase()}. Click any to copy.`;

	// Infinite scroll: render BATCH at a time, grow when the sentinel scrolls
	// into view. Blocks can have up to 1000 chars; rendering them all upfront
	// trashes initial paint with little benefit (most users only look at the top).
	const BATCH = 120;
	let visible = $state(Math.min(BATCH, chars.length));
	let sentinel = $state<HTMLDivElement | undefined>();

	const visibleChars = $derived(chars.slice(0, visible));

	onMount(() => {
		if (!sentinel || visible >= chars.length) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					visible = Math.min(visible + BATCH, chars.length);
				}
			},
			{ rootMargin: '600px' }
		);
		io.observe(sentinel);
		return () => io.disconnect();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={`https://fancynickna.me/symbols/block/${block.slug}`} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://fancynickna.me/symbols/block/${block.slug}`} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={`https://fancynickna.me/og.png?title=${encodeURIComponent(block.name)}&subtitle=Unicode+block`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`https://fancynickna.me/og.png?title=${encodeURIComponent(block.name)}`} />
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px);">
		<div
			style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft); margin-bottom: 12px;"
		>
			<a href="/symbols" style="color: inherit;">symbols</a> / block
		</div>
		<h1
			style="font-family: var(--font-display); font-size: clamp(32px, 6vw, 72px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 8px;"
		>
			{block.name}
		</h1>
		<div style="font-family: var(--font-mono); color: var(--fg-soft);">
			U+{block.rangeStart.toString(16).toUpperCase()}–U+{block.rangeEnd.toString(16).toUpperCase()} ·
			{chars.length} chars
		</div>
	</section>

	<section style="padding: 0 clamp(20px, 4vw, 56px) 80px;">
		<div
			style="display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));"
		>
			{#each visibleChars as c (c.codepoint)}
				<a
					href={`/c/${c.codepoint.toString(16)}`}
					title={c.name}
					style="border: 1px solid var(--line); border-radius: 12px; padding: 10px 6px; text-align: center; text-decoration: none; color: var(--fg); background: var(--card);"
				>
					<div style="font-family: serif; font-size: 28px; line-height: 1;">{c.char}</div>
					<div
						style="font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; color: var(--fg-soft); margin-top: 4px;"
					>
						{c.codepoint.toString(16).toUpperCase()}
					</div>
				</a>
			{/each}
		</div>
		{#if visible < chars.length}
			<div
				bind:this={sentinel}
				style="margin-top: 32px; text-align: center; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-soft);"
			>
				loading {chars.length - visible} more…
			</div>
		{/if}
	</section>

	<SiteFooter />
</main>
