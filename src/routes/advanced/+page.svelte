<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import TopBar from '$lib/components/TopBar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { lookalikesFor, specialPacks } from '$lib/lookalikes';
	import DecorationStep from '$lib/components/DecorationStep.svelte';
	import { nickName } from '$lib/stores/nick';

	// User types into a normal input. We track the caret position so we can show
	// suggestions for the character directly to the left of the cursor — i.e. the
	// last character they typed or selected. Clicking a suggestion replaces that
	// character (and pops the next typed character into focus).
	let inputEl: HTMLInputElement;
	let text = $state('');
	const unsubText = nickName.subscribe((v) => {
		text = v;
	});
	$effect(() => {
		nickName.set(text);
	});
	onDestroy(() => unsubText());
	let cursorPos = $state(4);
	let activePackId = $state<string | null>(null);

	// The character we're "editing right now" — the one at cursorPos - 1
	// (i.e. the character immediately to the left of the caret).
	const activeChar = $derived.by(() => {
		if (!text) return '';
		const i = Math.max(0, cursorPos - 1);
		return text[i] || '';
	});

	const activeIndex = $derived.by(() => {
		if (!text) return -1;
		return Math.max(0, cursorPos - 1);
	});

	const suggestions = $derived.by(() => {
		if (!activeChar) return [] as string[];
		const all = lookalikesFor(activeChar);
		// Move the currently-used character to the back so the user sees fresh options first
		return all.filter((c) => c !== text[activeIndex]).slice(0, 120);
	});

	function syncCursor() {
		if (!inputEl) return;
		cursorPos = inputEl.selectionStart ?? text.length;
	}

	function pickReplace(ch: string) {
		// Replace the character immediately to the left of the caret. If the input
		// is empty, just insert.
		if (!text) {
			text = ch;
			cursorPos = ch.length;
			focusAtEnd();
			return;
		}
		const idx = Math.max(0, cursorPos - 1);
		text = text.slice(0, idx) + ch + text.slice(idx + 1);
		cursorPos = idx + ch.length;
		focusAt(cursorPos);
	}

	function insertAtCursor(ch: string) {
		const selStart = inputEl?.selectionStart ?? cursorPos;
		const selEnd = inputEl?.selectionEnd ?? cursorPos;
		text = text.slice(0, selStart) + ch + text.slice(selEnd);
		cursorPos = selStart + ch.length;
		focusAt(cursorPos);
	}

	function focusAt(pos: number) {
		queueMicrotask(() => {
			if (!inputEl) return;
			inputEl.focus();
			inputEl.setSelectionRange(pos, pos);
		});
	}
	function focusAtEnd() {
		focusAt(text.length);
	}

	async function copyResult() {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast(`copied "${text}"`);
		} catch {
			toast('copy failed');
		}
	}

	function clearAll() {
		text = '';
		cursorPos = 0;
		focusAt(0);
	}
</script>

<svelte:head>
	<title>Advanced Nickname Maker | fancynickna.me</title>
	<meta
		name="description"
		content="Build a nickname letter by letter. Each character gets Unicode lookalike suggestions — Latin variants, Cyrillic, Greek, runic, math, and sparkle decorations. Click a suggestion to swap that letter."
	/>
	<link rel="canonical" href="https://fancynickna.me/advanced" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fancynickna.me/advanced" />
	<meta property="og:title" content="Advanced Nickname Maker | fancynickna.me" />
	<meta
		property="og:description"
		content="Build a nickname letter by letter — Unicode lookalikes for every character."
	/>
	<meta property="og:image" content="https://fancynickna.me/og.png?title=Advanced+Maker&subtitle=Pick+every+letter+from+all+of+Unicode." />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Advanced Nickname Maker | fancynickna.me" />
	<meta name="twitter:description" content="Build a nickname letter by letter — Unicode lookalikes for every character." />
	<meta name="twitter:image" content="https://fancynickna.me/og.png?title=Advanced+Maker" />
</svelte:head>

<TopBar />

<main>
	<section style="padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px) 24px; max-width: 1200px;">
		<h1
			style="font-family: var(--font-display); font-size: clamp(40px, 7vw, 96px); line-height: 0.95; letter-spacing: -0.025em; margin: 0 0 16px;"
		>
			advanced<br /><span class="accent-ink">maker.</span>
		</h1>
		<p style="color: var(--fg-soft); max-width: 720px; font-family: var(--font-sans); font-size: 17px; line-height: 1.55;">
			Just type. For every letter you write we surface every Unicode character that looks like it
			— Latin variants with accents (á ä å), Cyrillic homoglyphs (а е о), Greek lookalikes
			(α ν π), Cherokee, Math italics (𝓪 𝓮 𝓲), Runic (ᚨ), small caps (ᴀ), full-width
			(ａ), bubble (Ⓐ ⓐ) — anything that resembles your character. Click any suggestion to
			swap that letter in-place. Add sparkles, hearts, brackets and other decorative
			characters from the extras panel below.
		</p>
	</section>

	<!-- Input + copy bar -->
	<section style="padding: 0 clamp(20px, 4vw, 56px) 16px;">
		<div
			style="background: var(--card); border: 2px solid var(--fg); border-radius: 18px; padding: 22px; box-shadow: 6px 6px 0 var(--fg);"
		>
			<div
				style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 8px;"
			>
				type your nickname
			</div>
			<input
				bind:this={inputEl}
				bind:value={text}
				oninput={syncCursor}
				onclick={syncCursor}
				onkeyup={syncCursor}
				onselect={syncCursor}
				maxlength="64"
				placeholder="type something…"
				autocomplete="off"
				spellcheck="false"
				style="width: 100%; font-family: serif; font-size: clamp(28px, 4.5vw, 48px); line-height: 1.1; background: transparent; border: none; outline: none; color: var(--fg); padding: 0;"
			/>
			<div class="flex" style="gap: 8px; margin-top: 12px;">
				<button
					type="button"
					onclick={copyResult}
					disabled={!text}
					style="background: var(--fg); color: var(--bg); padding: 10px 18px; border-radius: 999px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; font-family: var(--font-sans); opacity: {text ? 1 : 0.4};"
				>copy</button>
				<button
					type="button"
					onclick={clearAll}
					disabled={!text}
					style="background: transparent; color: var(--fg); padding: 10px 18px; border-radius: 999px; font-weight: 500; font-size: 13px; border: 1px solid var(--line); cursor: pointer; font-family: var(--font-sans); opacity: {text ? 1 : 0.4};"
				>clear</button>
			</div>
		</div>
	</section>

	<!-- Suggestions panel — driven entirely by the input's caret position -->
	<section style="padding: 24px clamp(20px, 4vw, 56px);">
		{#if activeChar && suggestions.length}
			<div
				style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--fg-soft); margin-bottom: 10px;"
			>
				{suggestions.length} variants for "{activeChar}" — click to swap
			</div>
			<div
				style="display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 6px;"
			>
				{#each suggestions as c, i (i + c)}
					<button
						type="button"
						onclick={() => pickReplace(c)}
						title={`U+${c.codePointAt(0)?.toString(16).toUpperCase()}`}
						style="aspect-ratio: 1 / 1; background: var(--card); color: var(--fg); border: 1px solid var(--line); border-radius: 10px; font-family: serif; font-size: 22px; line-height: 1; cursor: pointer; transition: transform 80ms ease, box-shadow 80ms ease;"
						onmouseenter={(e) => {
							const el = e.currentTarget as HTMLElement;
							el.style.transform = 'translate(-1px, -1px)';
							el.style.boxShadow = '3px 3px 0 var(--accent), 3px 3px 0 1px var(--fg)';
						}}
						onmouseleave={(e) => {
							const el = e.currentTarget as HTMLElement;
							el.style.transform = '';
							el.style.boxShadow = '';
						}}
					>
						{c}
					</button>
				{/each}
			</div>
		{:else if text && !suggestions.length}
			<p style="color: var(--fg-soft);">
				no lookalikes for "{activeChar}" — try a Latin letter or digit.
			</p>
		{:else}
			<p style="color: var(--fg-soft);">
				start typing above. suggestions appear here as you go.
			</p>
		{/if}
	</section>

	<!-- Decorative extras: always available regardless of typed text -->
	<section style="padding: 0 clamp(20px, 4vw, 56px) 80px;">
		<div
			style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 10px;"
		>
			or sprinkle in some decoration — clicks insert at the caret
		</div>
		<div class="flex flex-wrap" style="gap: 8px; margin-bottom: 16px;">
			{#each specialPacks as p (p.id)}
				<button
					type="button"
					onclick={() => (activePackId = activePackId === p.id ? null : p.id)}
					style="padding: 8px 14px; background: {activePackId === p.id
						? 'var(--fg)'
						: 'transparent'}; color: {activePackId === p.id
						? 'var(--bg)'
						: 'var(--fg)'}; border: 1px solid var(--fg); border-radius: 999px; font-family: var(--font-mono); font-size: 12px; cursor: pointer;"
				>
					{p.label}
				</button>
			{/each}
		</div>

		{#if activePackId}
			{@const pack = specialPacks.find((p) => p.id === activePackId)}
			{#if pack}
				<div
					style="display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 6px;"
				>
					{#each pack.chars as c, i (i + c)}
						<button
							type="button"
							onclick={() => insertAtCursor(c)}
							title={`U+${c.codePointAt(0)?.toString(16).toUpperCase()}`}
							style="aspect-ratio: 1 / 1; background: var(--card); color: var(--fg); border: 1px solid var(--line); border-radius: 10px; font-family: serif; font-size: 22px; line-height: 1; cursor: pointer;"
						>
							{c}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</section>

	<DecorationStep name={text} heading="step 2 — wrap your custom name" />

	<SiteFooter />
</main>
