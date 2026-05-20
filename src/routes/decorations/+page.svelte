<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { decorations, decorationCategories, applyDecoration } from '$lib/decorations';
	import { nickName, nickStyleId } from '$lib/stores/nick';
	import { styles } from '$lib/fancyText';

	let name = $state('');
	let styleId = $state('');
	const unsubName = nickName.subscribe((v) => (name = v));
	const unsubStyle = nickStyleId.subscribe((v) => (styleId = v));
	$effect(() => {
		nickName.set(name);
	});
	onDestroy(() => {
		unsubName();
		unsubStyle();
	});

	const styleById = $derived(new Map(styles.map((s) => [s.id, s])));
	// Decoration wraps the styled output if a style is picked, otherwise the raw name
	const effectiveName = $derived.by(() => {
		const raw = name || 'Maya';
		const s = styleId ? styleById.get(styleId) : undefined;
		if (!s) return raw;
		try {
			return s.fn(raw);
		} catch {
			return raw;
		}
	});
	let category = $state<(typeof decorationCategories)[number]['id'] | 'all'>('all');
	let copiedId = $state<string | null>(null);

	const filtered = $derived(
		category === 'all' ? decorations : decorations.filter((d) => d.category === category)
	);

	async function copyDeco(id: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedId = id;
			toast(`copied`);
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 900);
		} catch {
			toast('copy failed');
		}
	}
</script>

<svelte:head>
	<title>Nickname decorations — fancynickna.me</title>
	<meta
		name="description"
		content="Premade nickname decorations — wrap your username with hearts, sparkles, gothic flourishes, kawaii faces, kingly crowns and classic MSN-era ASCII art. Click to copy with your name."
	/>
	<link rel="canonical" href="https://fancynickna.me/decorations" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/decorations" />
	<meta property="og:title" content="Nickname decorations — fancynickna.me" />
	<meta
		property="og:description"
		content="200+ premade decorations to wrap your nickname — hearts, sparkles, gothic, kawaii, MSN classics."
	/>
	<meta property="og:image" content="https://fancynickna.me/og.png?title=decorations&subtitle=200%2B+ASCII+wrappers+for+your+nickname." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Nickname decorations — fancynickna.me" />
	<meta name="twitter:description" content="200+ premade nickname wrappers — hearts, sparkles, gothic, kawaii, MSN classics." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=decorations" />
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 24px; max-width: 1200px;">
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			<span class="accent-ink">decorations.</span>
		</h1>
		<p style="color: var(--fg-soft); max-width: 720px; font-family: var(--font-sans); font-size: 17px; line-height: 1.55;">
			Premade ASCII / Unicode sequences that wrap your name — the kind people used in MSN
			Messenger, MySpace, early Skype and AIM. Categories include
			<strong>hearts</strong> (♡ ღ ❥), <strong>sparkles</strong> (✦ ✧ ⋆˚࿔),
			<strong>stars</strong> (★彡), <strong>flowers</strong> (✿ ❀ 🌸), <strong>royal</strong>
			crowns (♔ ♛ ⚜), <strong>gothic</strong> (✞ ☠ ꧁༒ ☬꧂), <strong>gaming</strong>
			(▰▱▰ ⫷ ⫸), brackets (【 】「 」), arrows (➤ ➔), kawaii faces
			(ʕ•ᴥ•ʔ ◕‿◕), MSN-era flourishes (·.·★ ★·.· ¸,ø¤º°`) and more. Type your
			name, browse a category, click any card to copy.
		</p>
	</section>

	<!-- Name input -->
	<section style="padding: 0 clamp(20px, 4vw, 56px) 16px;">
		<label
			for="name"
			style="display: block; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 8px;"
		>
			your name
		</label>
		<input
			id="name"
			bind:value={name}
			maxlength="40"
			placeholder="Maya"
			autocomplete="off"
			spellcheck="false"
			style="width: min(420px, 100%); padding: 14px 18px; font-family: var(--font-sans); font-size: 18px; background: var(--card); color: var(--fg); border: 2px solid var(--fg); border-radius: 14px; outline: none; box-shadow: 6px 6px 0 var(--fg);"
		/>
	</section>

	<!-- Category chips -->
	<section style="padding: 8px clamp(20px, 4vw, 56px) 12px;">
		<div class="flex flex-wrap" style="gap: 8px;">
			<button
				type="button"
				onclick={() => (category = 'all')}
				style="padding: 8px 14px; background: {category === 'all'
					? 'var(--fg)'
					: 'transparent'}; color: {category === 'all'
					? 'var(--bg)'
					: 'var(--fg)'}; border: 1px solid var(--fg); border-radius: 999px; font-family: var(--font-mono); font-size: 12px; cursor: pointer;"
			>
				all ({decorations.length})
			</button>
			{#each decorationCategories as c (c.id)}
				{@const count = decorations.filter((d) => d.category === c.id).length}
				<button
					type="button"
					onclick={() => (category = c.id)}
					style="padding: 8px 14px; background: {category === c.id
						? 'var(--fg)'
						: 'transparent'}; color: {category === c.id
						? 'var(--bg)'
						: 'var(--fg)'}; border: 1px solid var(--fg); border-radius: 999px; font-family: var(--font-mono); font-size: 12px; cursor: pointer;"
				>
					{c.label} ({count})
				</button>
			{/each}
		</div>
	</section>

	<!-- Decoration cards -->
	<section
		style="padding: 0 clamp(20px, 4vw, 56px) 80px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
	>
		{#each filtered as d (d.id)}
			{@const value = applyDecoration(effectiveName, d)}
			{@const isCopied = copiedId === d.id}
			<button
				type="button"
				onclick={() => copyDeco(d.id, value)}
				class="brut-card"
				style="text-align: left; background: var(--card); color: var(--fg); border: 2px solid var(--fg); border-radius: 18px; padding: 18px 20px; cursor: pointer; font: inherit; transition: transform 80ms ease, box-shadow 80ms ease; box-shadow: {isCopied
					? '4px 4px 0 var(--accent), 4px 4px 0 1.5px var(--fg)'
					: '6px 6px 0 var(--fg)'};"
			>
				<div
					style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-soft); margin-bottom: 8px; display: flex; justify-content: space-between; gap: 8px;"
				>
					<span>{d.category}</span>
					<span class="accent-ink">{isCopied ? 'copied' : 'copy'}</span>
				</div>
				<div
					style="font-family: serif; font-size: clamp(18px, 2.4vw, 24px); line-height: 1.2; word-break: break-word;"
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
