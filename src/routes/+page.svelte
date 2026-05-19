<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Marquee from '$lib/components/Marquee.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import SuggestionChips from '$lib/components/SuggestionChips.svelte';
	import ResultsGrid from '$lib/components/ResultsGrid.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { styles, decoPacks } from '$lib/fancyText';

	let name = $state('Maya');
	let copiedId = $state<string | null>(null);
	let tick = $state(0);
	const decoKey: keyof typeof decoPacks = 'none';
	const applyDeco = false;
	const deco = $derived(decoPacks[decoKey]);

	let interval: ReturnType<typeof setInterval>;
	onMount(() => {
		interval = setInterval(() => (tick = tick + 1), 1400);
	});
	onDestroy(() => clearInterval(interval));

	async function copy(id: string, styleName: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedId = id;
			toast(`copied "${styleName}"`);
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 900);
		} catch {
			toast('copy failed');
		}
	}
</script>

<svelte:head>
	<title>fancynickna.me — fancy nickname generator</title>
	<meta
		name="description"
		content="Free fancy nickname generator. Type your name once, get 25+ styled Unicode versions — bold, cursive, gothic, bubble, glitch and more. Click to copy."
	/>
	<meta property="og:title" content="fancynickna.me — fancy nickname generator" />
	<meta
		property="og:description"
		content="Free fancy nickname generator. 25+ styled Unicode versions, one tap to copy."
	/>
</svelte:head>

<Marquee />
<TopBar />

<main>
	<Hero
		bind:name
		styleCount={styles.length}
		decoCount={Object.keys(decoPacks).length}
		onInput={(v) => (name = v)}
		onClear={() => (name = '')}
	/>

	<SuggestionChips onPick={(s) => (name = s)} />

	<ResultsGrid {name} {styles} {deco} {applyDeco} {tick} {copiedId} onCopy={copy} />

	<FAQ />
	<SiteFooter />
</main>
