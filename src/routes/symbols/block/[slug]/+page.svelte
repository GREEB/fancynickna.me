<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	let { data } = $props();
	const { block, chars } = data;
	const title = `${block.name} — Unicode block · fancynickna.me`;
	const description = `Every character in the ${block.name} Unicode block. U+${block.rangeStart.toString(16).toUpperCase()} to U+${block.rangeEnd.toString(16).toUpperCase()}. Click any to copy.`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
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

	<section
		style="padding: 0 clamp(20px, 4vw, 56px) 80px; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));"
	>
		{#each chars as c (c.codepoint)}
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
	</section>

	<SiteFooter />
</main>
