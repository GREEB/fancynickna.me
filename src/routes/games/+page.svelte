<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	let { data } = $props();
	let q = $state(data.q);
</script>

<svelte:head>
	<title>All games — fancynickna.me</title>
	<meta
		name="description"
		content="Browse fancy nickname generators for every game. Steam, mobile, web, console — find your game and style your username."
	/>
	<link rel="canonical" href="https://fancynickna.me/games" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/games" />
	<meta property="og:title" content="All games — fancynickna.me" />
	<meta
		property="og:description"
		content="Fancy nickname generator for every game — built-in name rule checks per title."
	/>
	<meta property="og:image" content="https://fancynickna.me/og.png?title=every+game&subtitle=Per-game+name+rule+checks.+Built-in+styles." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="All games — fancynickna.me" />
	<meta name="twitter:description" content="Fancy nickname generator for every game." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=every+game" />
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 24px; max-width: 1200px;">
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			every game.
		</h1>
		<p style="color: var(--fg-soft); max-width: 580px;">
			find your game, type your name, get the fancy version.
		</p>

		<form method="GET" style="margin-top: 24px; max-width: 480px;">
			<input
				type="search"
				name="q"
				bind:value={q}
				placeholder="search games..."
				style="width: 100%; border: 2px solid var(--fg); border-radius: 999px; padding: 12px 18px; background: var(--card); font-family: var(--font-sans); font-size: 16px; color: var(--fg); outline: none;"
			/>
		</form>
	</section>

	<section
		style="padding: 24px clamp(20px, 4vw, 56px) 80px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));"
	>
		{#each data.games as g (g.id)}
			<a
				href={`/games/${g.slug}`}
				style="border: 1.5px solid var(--fg); border-radius: 14px; padding: 16px; text-decoration: none; color: var(--fg); background: var(--card);"
			>
				<div style="font-family: var(--font-display); font-size: 18px;">{g.name}</div>
				<div
					style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--fg-soft); margin-top: 4px;"
				>
					{g.platform ?? 'multi'}{g.genre ? ` · ${g.genre}` : ''}
				</div>
			</a>
		{:else}
			<div style="color: var(--fg-soft);">no games match. try a broader search.</div>
		{/each}
	</section>

	<SiteFooter />
</main>
