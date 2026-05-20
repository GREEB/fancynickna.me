<script lang="ts">
	import { toast } from 'svelte-sonner';
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { data } = $props();
	const { char, siblings } = data;

	const cpHex = char.codepoint.toString(16).toUpperCase();
	const title = `${char.char} ${char.name.toLowerCase()} — U+${cpHex} | fancynickna.me`;
	const description = `Copy and paste ${char.char} (${char.name.toLowerCase()}). Unicode character U+${cpHex} in ${char.block ?? 'Unicode'}. HTML entity ${char.htmlDec}, CSS escape ${char.cssEscape}, UTF-8 ${char.utf8Bytes}.`;

	async function copy(text: string, label: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast(`copied ${label}`);
		} catch {
			toast('copy failed');
		}
	}

	const structuredData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'DefinedTerm',
				name: char.name.toLowerCase(),
				alternateName: char.altNames ?? [],
				identifier: `U+${cpHex}`,
				description: `Unicode character ${char.char} (${char.name.toLowerCase()}), codepoint U+${cpHex}${char.block ? ` in the ${char.block} block` : ''}. Click to copy.`,
				inDefinedTermSet: char.block
					? { '@type': 'DefinedTermSet', name: char.block }
					: undefined,
				url: `https://fancynickna.me/c/${char.codepoint.toString(16)}`
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fancynickna.me/' },
					{ '@type': 'ListItem', position: 2, name: 'Symbols', item: 'https://fancynickna.me/symbols' },
					...(char.blockSlug
						? [
								{
									'@type': 'ListItem',
									position: 3,
									name: char.block,
									item: `https://fancynickna.me/symbols/block/${char.blockSlug}`
								},
								{
									'@type': 'ListItem',
									position: 4,
									name: `U+${cpHex}`,
									item: `https://fancynickna.me/c/${char.codepoint.toString(16)}`
								}
							]
						: [
								{
									'@type': 'ListItem',
									position: 3,
									name: `U+${cpHex}`,
									item: `https://fancynickna.me/c/${char.codepoint.toString(16)}`
								}
							])
				]
			}
		]
	};

	const rows: { label: string; value: string }[] = [
		{ label: 'character', value: char.char },
		{ label: 'name', value: char.name.toLowerCase() },
		{ label: 'codepoint', value: `U+${cpHex}` },
		{ label: 'block', value: char.block ?? '—' },
		{ label: 'category', value: char.category ?? '—' },
		{ label: 'script', value: char.script ?? '—' },
		{ label: 'introduced', value: char.age ? `unicode ${char.age}` : '—' },
		{ label: 'html decimal', value: char.htmlDec ?? '—' },
		{ label: 'html hex', value: char.htmlHex ?? '—' },
		{ label: 'html entity', value: char.htmlEntity ?? '—' },
		{ label: 'css escape', value: char.cssEscape ?? '—' },
		{ label: 'js escape', value: char.jsEscape ?? '—' },
		{ label: 'url encoded', value: char.urlEncoded ?? '—' },
		{ label: 'utf-8', value: char.utf8Bytes ?? '—' },
		{ label: 'utf-16', value: char.utf16Bytes ?? '—' }
	];
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={`https://fancynickna.me/c/${char.codepoint.toString(16)}`} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://fancynickna.me/c/${char.codepoint.toString(16)}`} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={`https://fancynickna.me/og.png?char=${encodeURIComponent(char.char)}&title=${encodeURIComponent(char.name.toLowerCase())}&subtitle=${encodeURIComponent(`U+${cpHex} · ${char.block ?? 'Unicode'}`)}`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`https://fancynickna.me/og.png?char=${encodeURIComponent(char.char)}&title=${encodeURIComponent(char.name.toLowerCase())}`} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`}
</svelte:head>

<TopBar />

<main>
	<section
		style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 32px; max-width: 1200px; display: grid; gap: 32px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);"
	>
		<div>
			<button
				onclick={() => copy(char.char, char.name.toLowerCase())}
				class="shadow-brut"
				style="border: 2px solid var(--fg); border-radius: 18px; background: var(--card); padding: clamp(40px, 6vw, 80px); font-family: serif; font-size: clamp(96px, 18vw, 220px); line-height: 1; cursor: pointer; width: 100%; color: var(--fg);"
				title="click to copy"
			>
				{char.char}
			</button>
			<div
				style="margin-top: 14px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft); text-align: center;"
			>
				click to copy
			</div>
		</div>

		<div>
			<div
				style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft);"
			>
				<a href="/symbols" style="color: inherit;">symbols</a>
				{#if char.blockSlug}/ <a href={`/symbols/block/${char.blockSlug}`} style="color: inherit;">{char.block}</a>{/if}
			</div>
			<h1
				style="font-family: var(--font-display); font-size: clamp(32px, 5vw, 64px); line-height: 1; letter-spacing: -0.02em; margin: 12px 0 8px;"
			>
				{char.name.toLowerCase()}
			</h1>
			<div style="color: var(--fg-soft); font-family: var(--font-mono);">U+{cpHex}</div>

			<div style="margin-top: 28px; display: grid; gap: 0; border: 1.5px solid var(--fg); border-radius: 14px; overflow: hidden;">
				{#each rows as r, i (r.label)}
					<button
						onclick={() => copy(r.value, r.label)}
						style="display: grid; grid-template-columns: 140px 1fr; padding: 12px 16px; text-align: left; background: {i % 2 === 0 ? 'var(--card)' : 'transparent'}; border: none; border-bottom: 1px solid var(--line); cursor: pointer; color: var(--fg); font-family: var(--font-sans);"
					>
						<span
							style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-soft); align-self: center;"
							>{r.label}</span
						>
						<span style="font-family: var(--font-mono); font-size: 13px; word-break: break-all;">
							{r.value}
						</span>
					</button>
				{/each}
			</div>
		</div>
	</section>

	{#if siblings.length > 0}
		<section style="padding: 40px clamp(20px, 4vw, 56px) 80px; border-top: 2px solid var(--fg);">
			<h2
				style="font-family: var(--font-display); font-size: clamp(24px, 4vw, 36px); letter-spacing: -0.02em; margin: 0 0 18px;"
			>
				nearby in {char.block}
			</h2>
			<div
				style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));"
			>
				{#each siblings as s (s.codepoint)}
					<a
						href={`/c/${s.codepoint.toString(16)}`}
						style="border: 1.5px solid var(--fg); border-radius: 14px; padding: 12px; text-align: center; text-decoration: none; color: var(--fg); background: var(--card);"
					>
						<div style="font-family: serif; font-size: 32px; line-height: 1;">{s.char}</div>
						<div
							style="font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--fg-soft); margin-top: 6px;"
						>
							U+{s.codepoint.toString(16).toUpperCase()}
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<SiteFooter />
</main>
