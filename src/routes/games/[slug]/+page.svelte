<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import TopBar from '$lib/components/TopBar.svelte';
	import ResultsGrid from '$lib/components/ResultsGrid.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { styles, decoPacks } from '$lib/fancyText';

	let { data } = $props();
	const { game, related } = data;

	const initial =
		game.maxNameLen && game.maxNameLen < 8 ? 'Player' : `${game.name.split(/\s+/)[0]}Player`;
	let name = $state(initial);
	let copiedId = $state<string | null>(null);
	let tick = $state(0);
	const deco = decoPacks.none;

	let interval: ReturnType<typeof setInterval>;
	onMount(() => {
		interval = setInterval(() => (tick = tick + 1), 1400);
	});
	onDestroy(() => clearInterval(interval));

	// Filter styles compatible with game rules
	const compatibleStyles = $derived(
		game.allowedCharsRegex
			? styles.filter((s) => {
					try {
						return new RegExp(game.allowedCharsRegex!).test(s.fn('TestName'));
					} catch {
						return true;
					}
				})
			: styles
	);

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

	const title = `${game.name} Fancy Nickname Generator — fancynickna.me`;
	const description = `Free fancy nickname generator for ${game.name}. ${compatibleStyles.length} styled Unicode versions filtered for ${game.name}'s name rules. One tap to copy.`;

	const faq = [
		{
			q: `What name length does ${game.name} allow?`,
			a:
				game.minNameLen && game.maxNameLen
					? `${game.name} allows nicknames between ${game.minNameLen} and ${game.maxNameLen} characters.`
					: `Check ${game.name}'s in-game settings for exact length limits.`
		},
		{
			q: `Will fancy unicode names work in ${game.name}?`,
			a: game.allowedCharsRegex
				? `${game.name} only allows ${game.allowedCharsRegex} — most fancy unicode characters will be rejected. Try the styles below that pass that filter.`
				: `Most styles work. Some platforms strip combining characters (zalgo/glitch) — try a different style if one breaks.`
		},
		{
			q: `How do I change my nickname in ${game.name}?`,
			a: `Open ${game.name}, go to your profile or account settings, find the change name option. Paste the styled nickname you copied here.`
		},
		{
			q: 'Is it free?',
			a: 'Yes. Forever. No signup, no ads, no tracking.'
		}
	];

	const structuredData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'SoftwareApplication',
				name: `${game.name} Fancy Nickname Generator`,
				applicationCategory: 'UtilityApplication',
				operatingSystem: 'Any',
				offers: { '@type': 'Offer', price: '0' }
			},
			{
				'@type': 'FAQPage',
				mainEntity: faq.map((f) => ({
					'@type': 'Question',
					name: f.q,
					acceptedAnswer: { '@type': 'Answer', text: f.a }
				}))
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
					{ '@type': 'ListItem', position: 2, name: 'Games', item: '/games' },
					{ '@type': 'ListItem', position: 3, name: game.name, item: `/games/${game.slug}` }
				]
			}
		]
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={`/games/${game.slug}`} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if game.coverUrl}<meta property="og:image" content={game.coverUrl} />{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`}
</svelte:head>

<TopBar />

<main>
	<section
		style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 32px; max-width: 1200px;"
	>
		<div
			style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft); margin-bottom: 12px;"
		>
			<a href="/games" style="color: inherit;">games</a> / {game.platform ?? 'multi'}
		</div>
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			{game.name}<br /><span style="color: var(--accent);">fancy nickname generator</span>
		</h1>
		<p
			style="font-size: clamp(15px, 1.4vw, 18px); line-height: 1.5; color: var(--fg-soft); max-width: 640px;"
		>
			{game.description ??
				`Type a name, get ${compatibleStyles.length}+ styled versions that fit ${game.name}'s rules. Tap any card to copy.`}
		</p>

		<div
			class="shadow-brut"
			style="max-width: 640px; border: 2px solid var(--fg); border-radius: 18px; padding: 18px 22px; background: var(--card); margin-top: 32px;"
		>
			<div
				style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 8px;"
			>
				your {game.name} name
			</div>
			<input
				type="text"
				bind:value={name}
				maxlength={game.maxNameLen ?? 32}
				placeholder="type something..."
				style="font-family: var(--font-display); font-size: clamp(28px, 4.5vw, 48px); background: transparent; border: none; outline: none; letter-spacing: -0.02em; width: 100%; color: var(--fg);"
			/>
		</div>

		{#if game.minNameLen || game.maxNameLen || game.allowedCharsRegex}
			<div
				class="flex flex-wrap gap-3"
				style="margin-top: 18px; font-family: var(--font-mono); font-size: 12px; color: var(--fg-soft);"
			>
				{#if game.minNameLen}<span>min {game.minNameLen}</span>{/if}
				{#if game.maxNameLen}<span>• max {game.maxNameLen}</span>{/if}
				{#if game.allowedCharsRegex}<span>• allowed: <code>{game.allowedCharsRegex}</code></span>{/if}
			</div>
		{/if}
	</section>

	<ResultsGrid {name} styles={compatibleStyles} {deco} applyDeco={false} {tick} {copiedId} onCopy={copy} />

	<!-- FAQ -->
	<section
		style="padding: 60px clamp(20px, 4vw, 56px); border-top: 2px solid var(--fg); background: color-mix(in oklab, var(--fg) 4%, var(--bg));"
	>
		<h2
			style="font-family: var(--font-display); font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em; margin: 0 0 24px;"
		>
			{game.name} nickname questions
		</h2>
		<div
			style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));"
		>
			{#each faq as item (item.q)}
				<div>
					<div style="font-family: var(--font-display); font-size: 17px; margin-bottom: 8px;">
						{item.q}
					</div>
					<div style="font-size: 14.5px; color: var(--fg-soft); line-height: 1.5;">{item.a}</div>
				</div>
			{/each}
		</div>
	</section>

	{#if related.length > 0}
		<section style="padding: 60px clamp(20px, 4vw, 56px); border-top: 2px solid var(--fg);">
			<h2
				style="font-family: var(--font-display); font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em; margin: 0 0 24px;"
			>
				more games like this
			</h2>
			<div style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
				{#each related as g (g.id)}
					<a
						href={`/games/${g.slug}`}
						style="border: 1.5px solid var(--fg); border-radius: 14px; padding: 16px; text-decoration: none; color: var(--fg); background: var(--card); display: block;"
					>
						<div style="font-family: var(--font-display); font-size: 18px;">{g.name}</div>
						<div
							style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--fg-soft); margin-top: 4px;"
						>
							{g.platform ?? 'multi'} · {g.genre ?? 'game'}
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<SiteFooter />
</main>
