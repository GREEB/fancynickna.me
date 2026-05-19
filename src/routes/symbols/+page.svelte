<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Symbols & characters — fancynickna.me</title>
	<meta
		name="description"
		content="Every Unicode symbol, organized by block. Heart symbols, arrows, math, currency, emoji — copy with one tap."
	/>
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px);">
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			every symbol.
		</h1>
		<p style="color: var(--fg-soft); max-width: 580px;">
			browse Unicode by block. {data.blocks.length} blocks, hundreds of thousands of characters.
		</p>
	</section>

	<section
		style="padding: 0 clamp(20px, 4vw, 56px) 80px; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));"
	>
		{#each data.blocks as b (b.id)}
			<a
				href={`/symbols/block/${b.slug}`}
				style="border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; text-decoration: none; color: var(--fg);"
			>
				<div style="font-size: 14px;">{b.name}</div>
				<div style="font-family: var(--font-mono); font-size: 11px; color: var(--fg-soft); margin-top: 2px;">
					U+{b.rangeStart.toString(16).toUpperCase()}–U+{b.rangeEnd.toString(16).toUpperCase()}
				</div>
			</a>
		{/each}
	</section>

	<SiteFooter />
</main>
