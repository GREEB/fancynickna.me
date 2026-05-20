<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { styles, applyStyle, decoPacks } from '$lib/fancyText';

	let sample = $state('Maya');
	let copiedId = $state<string | null>(null);
	let tick = $state(0);

	let interval: ReturnType<typeof setInterval>;
	onMount(() => {
		interval = setInterval(() => (tick = tick + 1), 1400);
	});
	onDestroy(() => clearInterval(interval));

	const none = decoPacks.none;

	function preview(s: (typeof styles)[number], _tick: number): string {
		void _tick; // glitch styles re-roll each tick
		return applyStyle(sample || 'Maya', s, none, false);
	}

	async function copy(id: string, name: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedId = id;
			toast(`copied "${name}"`);
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 900);
		} catch {
			toast('copy failed');
		}
	}
</script>

<svelte:head>
	<title>All Fancy Text Styles | fancynickna.me</title>
	<meta
		name="description"
		content="Every fancy nickname style — bold, italic, cursive, gothic, bubble, fullwidth, small caps, glitch and 30+ more. Live preview with your own name. Click any style to copy."
	/>
	<link rel="canonical" href="https://fancynickna.me/styles" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/styles" />
	<meta property="og:title" content="All Fancy Text Styles | fancynickna.me" />
	<meta property="og:description" content="Every fancy nickname style — bold, cursive, gothic, bubble, glitch and more. Live preview, click to copy." />
	<meta property="og:image" content="https://fancynickna.me/og.png?title=All+Styles&subtitle=38+fancy+text+transforms.+Live+preview." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="All Fancy Text Styles | fancynickna.me" />
	<meta name="twitter:description" content="38+ fancy nickname styles. Live preview, click to copy." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=All+Styles" />
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 24px;">
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			all styles.
		</h1>
		<p style="color: var(--fg-soft); max-width: 580px; font-family: var(--font-sans);">
			{styles.length} ways to dress up your name. type below to preview every one of them with your name.
		</p>
	</section>

	<section style="padding: 8px clamp(20px, 4vw, 56px) 32px;">
		<label for="sample" style="display: block; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--fg-soft); margin-bottom: 8px;">try a name</label>
		<input
			id="sample"
			bind:value={sample}
			placeholder="Maya"
			autocomplete="off"
			spellcheck="false"
			maxlength="40"
			style="width: min(420px, 100%); padding: 14px 18px; font-family: var(--font-sans); font-size: 18px; background: var(--card); color: var(--fg); border: 2px solid var(--fg); border-radius: 14px; outline: none; box-shadow: 6px 6px 0 var(--fg);"
		/>
	</section>

	<section
		style="padding: 0 clamp(20px, 4vw, 56px) 80px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
	>
		{#each styles as s (s.id)}
			{@const value = preview(s, tick)}
			{@const isCopied = copiedId === s.id}
			<button
				type="button"
				onclick={() => copy(s.id, s.name, value)}
				class="brut-card"
				style="text-align: left; background: var(--card); color: var(--fg); border: 2px solid var(--fg); border-radius: 18px; padding: 18px 20px; cursor: pointer; font: inherit; transition: transform 80ms ease, box-shadow 80ms ease; box-shadow: {isCopied
					? '4px 4px 0 var(--accent), 4px 4px 0 1.5px var(--fg)'
					: '6px 6px 0 var(--fg)'};"
			>
				<div
					style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-soft); margin-bottom: 8px; display: flex; justify-content: space-between; gap: 8px;"
				>
					<span>{s.name}</span>
					<span class="accent-ink">{isCopied ? 'copied' : 'copy'}</span>
				</div>
				<div
					style="font-family: serif; font-size: clamp(22px, 3.4vw, 30px); line-height: 1.1; word-break: break-word;"
				>
					{value}
				</div>
			</button>
		{/each}
	</section>

	<SiteFooter />
</main>

<style>
	.brut-card:hover {
		transform: translate(-2px, -2px);
		box-shadow: 8px 8px 0 var(--accent), 8px 8px 0 1.5px var(--fg) !important;
	}
	.brut-card:active {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 var(--fg) !important;
	}
</style>
