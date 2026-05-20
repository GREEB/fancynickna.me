<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>About — fancynickna.me</title>
	<meta
		name="description"
		content="fancynickna.me is a free fancy nickname generator. No signup, no ads, anonymous analytics only. Just type your name and copy a styled Unicode version for games and social profiles."
	/>
	<link rel="canonical" href="https://fancynickna.me/about" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/about" />
	<meta property="og:title" content="About — fancynickna.me" />
	<meta
		property="og:description"
		content="Free fancy nickname generator. No signup, no ads, anonymous analytics only."
	/>
	<meta property="og:image" content="https://fancynickna.me/og.png?title=about&subtitle=Free.+No+signup.+No+tracking." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About — fancynickna.me" />
	<meta name="twitter:description" content="Free fancy nickname generator. No signup, no ads, anonymous analytics only." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=about" />
</svelte:head>

<TopBar />

<main>
	<section
		style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 24px; max-width: 760px;"
	>
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 24px;"
		>
			about.
		</h1>
		<p style="font-family: var(--font-sans); font-size: 18px; line-height: 1.55; color: var(--fg); margin: 0 0 18px;">
			<strong>fancynickna.me</strong> turns plain text into fancy Unicode characters so your
			profile, leaderboard or game tag stands out. It's a generator — not magic — so the styles
			work everywhere that lets you use letters, which is almost everywhere.
		</p>
		<p style="font-family: var(--font-sans); font-size: 18px; line-height: 1.55; color: var(--fg); margin: 0 0 32px;">
			No signup. No ads. No subscriptions. Just anonymous Google Analytics so we know which
			styles are popular — opt out with the banner on first visit if you don't want it. Type,
			click, paste.
		</p>
	</section>

	<section style="padding: 0 clamp(20px, 4vw, 56px) 32px; max-width: 760px;">
		<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3.4vw, 36px); margin: 0 0 12px;">
			how to use it
		</h2>
		<ol
			style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg); padding-left: 22px; margin: 0 0 32px;"
		>
			<li>type your name on the home page.</li>
			<li>scroll through the styled versions.</li>
			<li>click any card — it copies to your clipboard.</li>
			<li>paste anywhere: Discord, Instagram, Roblox, in-game name fields, whatever.</li>
		</ol>

		<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3.4vw, 36px); margin: 0 0 12px;">
			how it works
		</h2>
		<p style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg); margin: 0 0 12px;">
			the fancy characters are real Unicode codepoints — mathematical alphanumerics, enclosed
			alphabetics, fullwidth forms, small caps, combining marks for the zalgo styles, and so on.
			that's why they look different in every font and sometimes break in games that filter
			characters aggressively (looking at you, Minecraft).
		</p>
		<p style="font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--fg); margin: 0 0 32px;">
			each <a href="/games" class="accent-ink" style="text-decoration: underline; text-underline-offset: 3px;">game page</a>
			only shows styles that pass that game's name rules. so you don't get suggestions that the
			game will reject.
		</p>

		<h2 style="font-family: var(--font-display); font-size: clamp(24px, 3.4vw, 36px); margin: 0 0 12px;">
			explore
		</h2>
		<ul
			style="font-family: var(--font-sans); font-size: 16px; line-height: 1.7; color: var(--fg); list-style: none; padding: 0; margin: 0 0 40px;"
		>
			<li>
				→ <a href="/styles" class="accent-ink" style="text-decoration: underline; text-underline-offset: 3px;">all styles</a>
				— browse and preview every transform.
			</li>
			<li>
				→ <a href="/games" class="accent-ink" style="text-decoration: underline; text-underline-offset: 3px;">games</a>
				— curated rules for popular titles.
			</li>
			<li>
				→ <a href="/symbols" class="accent-ink" style="text-decoration: underline; text-underline-offset: 3px;">symbols</a>
				— every Unicode block, every character, copyable.
			</li>
		</ul>

		<p style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-soft); text-transform: uppercase; letter-spacing: 0.06em;">
			built with sveltekit, bun, postgres and a lot of Unicode tables.
		</p>
	</section>

	<SiteFooter />
</main>
