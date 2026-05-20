<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Marquee from '$lib/components/Marquee.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import SuggestionChips from '$lib/components/SuggestionChips.svelte';
	import ResultsGrid from '$lib/components/ResultsGrid.svelte';
	import DecorationStep from '$lib/components/DecorationStep.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { styles, decoPacks } from '$lib/fancyText';

	// Start empty — the empty state with the placeholder + bouncing input cue
	// makes the "type your name here" affordance obvious.
	let name = $state('');
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
	<title>fancynickna.me — fancy nickname generator (free, no signup)</title>
	<meta
		name="description"
		content="Free fancy nickname generator. Type your name once, get 25+ styled Unicode versions — bold, cursive, gothic, bubble, glitch and more. Click to copy. No signup, no ads, anonymous analytics only."
	/>
	<link rel="canonical" href="https://fancynickna.me/" />
	<meta name="theme-color" content="#f5f2ea" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/" />
	<meta property="og:site_name" content="fancynickna.me" />
	<meta property="og:title" content="fancynickna.me — fancy nickname generator" />
	<meta
		property="og:description"
		content="Free fancy nickname generator. 25+ styled Unicode versions, one tap to copy."
	/>
	<meta property="og:image" content="https://fancynickna.me/og.png?title=fancy+nickname+generator" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="fancynickna.me — fancy nickname generator" />
	<meta
		name="twitter:description"
		content="Free fancy nickname generator. 25+ styled Unicode versions, one tap to copy."
	/>
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=fancy+nickname+generator" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'fancynickna.me',
		url: 'https://fancynickna.me/',
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Web',
		description:
			'Free fancy nickname generator. 25+ Unicode text styles for games, Discord, Instagram, TikTok and more.',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		isAccessibleForFree: true
	})}<\/script>`}
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

	<DecorationStep {name} />

	<!-- Long-form intro content for SEO + first-time visitors who scroll past the generator -->
	<section
		style="padding: 60px clamp(20px, 4vw, 56px); max-width: 980px; margin: 0 auto; display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));"
	>
		<div>
			<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); margin: 0 0 10px;">
				what is a <span class="accent-ink">fancy nickname?</span>
			</h2>
			<p style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg);">
				A fancy nickname is your regular text rendered with Unicode characters that <em>look</em> like
				styled fonts — bold (𝐌𝐚𝐲𝐚), italic (𝑀𝑎𝑦𝑎), cursive (𝑀𝒶𝓎𝒶), gothic (𝔐𝔞𝔶𝔞),
				bubble (Ⓜⓐⓨⓐ), full-width (Ｍａｙａ), upside-down (ɐʎɐɯ) and more. They aren't
				images or HTML formatting — they're real characters, so they survive copy-paste into Discord,
				Instagram, Roblox, TikTok, Twitch, any game's name field, basically anywhere that accepts text.
			</p>
		</div>
		<div>
			<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); margin: 0 0 10px;">
				how it works
			</h2>
			<p style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg);">
				Most styles map ASCII letters to Unicode mathematical alphabets
				(U+1D400–U+1D7FF) — these were originally designed for math notation but
				render universally. Bubble letters live in the Enclosed Alphanumerics block,
				full-width forms in Halfwidth and Fullwidth Forms, upside-down characters are
				hand-picked lookalikes. Combining marks add zalgo, strikethrough and underline.
				All transformations are pure functions: type once, get every style in parallel.
			</p>
		</div>
		<div>
			<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); margin: 0 0 10px;">
				where it works
			</h2>
			<p style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg);">
				Discord usernames, Instagram bios, TikTok handles, Twitter display names, Roblox/Minecraft
				display names (where allowed), in-game tags for Fortnite, Valorant, League of Legends,
				Genshin Impact, PUBG, Free Fire, Mobile Legends, Brawl Stars and dozens more —
				<a href="/games" class="accent-ink" style="text-decoration: underline;">browse the games
				library</a> for per-title rules. The
				<a href="/advanced" class="accent-ink" style="text-decoration: underline;">advanced maker</a>
				lets you hand-pick every character; the
				<a href="/decorations" class="accent-ink" style="text-decoration: underline;">decorations
				library</a> wraps your name in MSN-era flourishes; the
				<a href="/3d" class="accent-ink" style="text-decoration: underline;">3D renderer</a>
				turns it into a PFP or wallpaper.
			</p>
		</div>
		<div>
			<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); margin: 0 0 10px;">
				free, no signup, no ads
			</h2>
			<p style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg);">
				No accounts. No ads. The generator runs entirely in your browser — your name never leaves
				your device. We use Google Analytics to see which styles are popular (you can opt out
				with the banner the first time you visit). Built with SvelteKit and a lot of Unicode
				tables.
			</p>
		</div>
	</section>

	<FAQ />
	<SiteFooter />
</main>
