<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { decorations, decorationCategories, applyDecoration } from '$lib/decorations';
	import { nickStyleId } from '$lib/stores/nick';
	import { styles } from '$lib/fancyText';

	interface Props {
		name: string;
		heading?: string;
	}
	let { name, heading = 'step 2 — wrap it with a decoration' }: Props = $props();

	const INITIAL = 9;

	let category = $state<(typeof decorationCategories)[number]['id'] | 'all'>('all');
	let copiedId = $state<string | null>(null);
	let expanded = $state(false);

	// Apply the globally-picked style to the name before wrapping it with the
	// decoration. If no style is picked, the raw name is used.
	let styleId = $state('');
	const unsubStyle = nickStyleId.subscribe((v) => (styleId = v));
	onDestroy(() => unsubStyle());
	const styleById = $derived(new Map(styles.map((s) => [s.id, s])));

	const filtered = $derived(
		category === 'all' ? decorations : decorations.filter((d) => d.category === category)
	);

	const visible = $derived(expanded ? filtered : filtered.slice(0, INITIAL));

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

	function pickCategory(c: typeof category) {
		category = c;
		expanded = false;
	}

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

<section style="padding: 16px clamp(20px, 4vw, 56px) 32px;">
	<div
		style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 6px;"
	>
		{heading}
	</div>
	<h2
		style="font-family: var(--font-display); font-size: clamp(24px, 3.4vw, 40px); line-height: 1; letter-spacing: -0.02em; margin: 0 0 16px;"
	>
		wrap "{effectiveName}" in something fancy.
	</h2>

	<div class="deco-layout">
		<!-- Sidebar -->
		<aside class="deco-sidebar">
			<button
				type="button"
				class="cat-btn"
				class:active={category === 'all'}
				onclick={() => pickCategory('all')}
			>
				<span>all</span>
				<span class="cat-count">{decorations.length}</span>
			</button>
			{#each decorationCategories as c (c.id)}
				{@const count = decorations.filter((d) => d.category === c.id).length}
				<button
					type="button"
					class="cat-btn"
					class:active={category === c.id}
					onclick={() => pickCategory(c.id)}
				>
					<span>{c.label}</span>
					<span class="cat-count">{count}</span>
				</button>
			{/each}
		</aside>

		<!-- Grid -->
		<div>
			<div class="deco-grid">
				{#each visible as d (d.id)}
					{@const value = applyDecoration(effectiveName, d)}
					{@const isCopied = copiedId === d.id}
					<button
						type="button"
						onclick={() => copyDeco(d.id, value)}
						class="deco-card"
						style="box-shadow: {isCopied
							? '4px 4px 0 var(--accent), 4px 4px 0 1.5px var(--fg)'
							: '5px 5px 0 var(--fg)'};"
					>
						<div class="deco-meta">
							<span>{d.category}</span>
							<span class="accent-ink">{isCopied ? 'copied' : 'copy'}</span>
						</div>
						<div class="deco-preview">{value}</div>
					</button>
				{/each}
			</div>

			{#if filtered.length > INITIAL}
				<div style="margin-top: 14px;">
					<button
						type="button"
						onclick={() => (expanded = !expanded)}
						class="show-more"
					>
						{expanded ? 'show less' : `show ${filtered.length - INITIAL} more`}
					</button>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.deco-layout {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}
	@media (max-width: 720px) {
		.deco-layout {
			grid-template-columns: 1fr;
		}
		.deco-sidebar {
			display: flex !important;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 6px;
		}
	}

	.deco-sidebar {
		display: grid;
		gap: 4px;
		position: sticky;
		top: 12px;
	}

	.cat-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--line);
		border-radius: 8px;
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: lowercase;
		cursor: pointer;
		text-align: left;
	}
	.cat-btn:hover {
		border-color: var(--fg);
	}
	.cat-btn.active {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}
	.cat-count {
		opacity: 0.65;
		font-variant-numeric: tabular-nums;
	}

	.deco-grid {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}

	.deco-card {
		text-align: left;
		background: var(--card);
		color: var(--fg);
		border: 2px solid var(--fg);
		border-radius: 14px;
		padding: 14px 16px;
		cursor: pointer;
		font: inherit;
		transition: transform 80ms ease, box-shadow 80ms ease;
	}
	.deco-card:hover {
		transform: translate(-2px, -2px);
		box-shadow: 7px 7px 0 var(--accent), 7px 7px 0 1.5px var(--fg) !important;
	}
	.deco-card:active {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 var(--fg) !important;
	}

	.deco-meta {
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg-soft);
		margin-bottom: 6px;
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}

	.deco-preview {
		font-family: serif;
		font-size: clamp(15px, 1.9vw, 20px);
		line-height: 1.2;
		word-break: break-word;
	}

	.show-more {
		background: transparent;
		color: var(--fg);
		padding: 10px 18px;
		border: 1.5px solid var(--fg);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
	}
	.show-more:hover {
		background: var(--fg);
		color: var(--bg);
	}
</style>
