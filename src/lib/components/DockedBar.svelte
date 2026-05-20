<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { nickName, nickStyleId, nickDecoId } from '$lib/stores/nick';
	import { styles } from '$lib/fancyText';
	import { decorations, decorationCategories, applyDecoration } from '$lib/decorations';

	type PickerMode = 'style' | 'deco' | null;

	let dismissed = $state(false);
	let picker = $state<PickerMode>(null);

	const styleById = $derived(new Map(styles.map((s) => [s.id, s])));
	const decoById = $derived(new Map(decorations.map((d) => [d.id, d])));

	let name = $state('');
	let styleId = $state('');
	let decoId = $state('');
	const unsubName = nickName.subscribe((v) => (name = v));
	const unsubStyle = nickStyleId.subscribe((v) => (styleId = v));
	const unsubDeco = nickDecoId.subscribe((v) => (decoId = v));
	onDestroy(() => {
		unsubName();
		unsubStyle();
		unsubDeco();
	});

	const chosenStyle = $derived(styleId ? styleById.get(styleId) : undefined);
	const chosenDeco = $derived(decoId ? decoById.get(decoId) : undefined);

	// Build pipeline: raw -> styled -> decorated. Each stage is optional so the
	// dock works the same whether the user picked nothing, just a style, just a
	// decoration, or both.
	function styleFor(s: { fn: (input: string) => string } | undefined, raw: string): string {
		const n = raw.trim() || 'YourName';
		if (!s) return n;
		try {
			return s.fn(n);
		} catch {
			return n;
		}
	}

	function composedValue(): string {
		const styled = styleFor(chosenStyle, name);
		return chosenDeco ? applyDecoration(styled, chosenDeco) : styled;
	}

	const hasContent = $derived(
		name.trim().length > 0 || styleId !== '' || decoId !== ''
	);

	// Show the result preview only when it differs from the raw input
	// (otherwise the dock just duplicates what's in the input field).
	const showPreview = $derived(chosenStyle !== undefined || chosenDeco !== undefined);

	async function copyComposed() {
		try {
			await navigator.clipboard.writeText(composedValue());
			const label = chosenDeco?.id ?? chosenStyle?.name ?? 'plain';
			toast(`copied "${label}"`);
		} catch {
			toast('copy failed');
		}
	}

	function clearAll() {
		nickName.set('');
		nickStyleId.set('');
		nickDecoId.set('');
	}

	function onInput(e: Event) {
		nickName.set((e.currentTarget as HTMLInputElement).value);
	}

	function pickStyle(id: string) {
		nickStyleId.set(id);
		picker = null;
	}
	function clearStyle() {
		nickStyleId.set('');
		picker = null;
	}
	function pickDeco(id: string) {
		nickDecoId.set(id);
		picker = null;
	}
	function clearDeco() {
		nickDecoId.set('');
		picker = null;
	}

	// Group decorations by category for the picker (keeps it scannable —
	// 200+ decorations in a flat grid is overwhelming).
	const decosByCategory = $derived(() => {
		const map = new Map<string, typeof decorations>();
		for (const d of decorations) {
			if (!map.has(d.category)) map.set(d.category, []);
			map.get(d.category)!.push(d);
		}
		return decorationCategories.map((c) => ({
			id: c.id,
			label: c.label,
			items: map.get(c.id) ?? []
		}));
	});

	// Sample shown inside each deco card (uses the user's name if any).
	function decoPreview(d: { pre: string; post: string }): string {
		const styled = styleFor(chosenStyle, name);
		return `${d.pre}${styled}${d.post}`;
	}
</script>

{#if hasContent && !dismissed}
	<aside class="dock" role="region" aria-label="Your saved nickname">
		<div class="dock-pills">
			<button
				type="button"
				class="dock-tag"
				class:open={picker === 'style'}
				title="click to change style"
				onclick={() => (picker = picker === 'style' ? null : 'style')}
			>
				{#if chosenStyle}
					<span class="dock-tag-label">{chosenStyle.name}</span>
				{:else}
					<span class="dock-tag-label dock-tag-label-soft">plain</span>
				{/if}
				<span class="dock-tag-caret" aria-hidden="true">▴</span>
			</button>

			<button
				type="button"
				class="dock-tag dock-tag-deco"
				class:open={picker === 'deco'}
				title="click to add a decoration"
				onclick={() => (picker = picker === 'deco' ? null : 'deco')}
			>
				{#if chosenDeco}
					<span class="dock-tag-label">{chosenDeco.pre}{chosenDeco.post}</span>
				{:else}
					<span class="dock-tag-label dock-tag-label-soft">+ deco</span>
				{/if}
				<span class="dock-tag-caret" aria-hidden="true">▴</span>
			</button>
		</div>

		<div class="dock-io">
			<input
				class="dock-input"
				value={name}
				placeholder="your name"
				maxlength="40"
				autocomplete="off"
				spellcheck="false"
				oninput={onInput}
			/>
			{#if showPreview}
				<div class="dock-result" title={composedValue()}>{composedValue()}</div>
			{/if}
		</div>

		<button type="button" class="dock-btn" onclick={copyComposed} title="copy">copy</button>
		<button type="button" class="dock-btn dock-btn-icon" onclick={clearAll} title="clear">×</button>
		<button
			type="button"
			class="dock-btn dock-btn-icon dock-dismiss"
			onclick={() => (dismissed = true)}
			title="hide for this session"
		>—</button>
	</aside>

	{#if picker !== null}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="picker-backdrop" onclick={() => (picker = null)}></div>
		<div class="picker" role="dialog" aria-label={picker === 'style' ? 'Pick a style' : 'Pick a decoration'}>
			<div class="picker-head">
				<span>{picker === 'style' ? 'pick a style' : 'pick a decoration'}</span>
				<div class="picker-actions">
					<button
						type="button"
						class="picker-clear"
						onclick={picker === 'style' ? clearStyle : clearDeco}
					>{picker === 'style' ? 'plain' : 'no deco'}</button>
					<button
						type="button"
						class="picker-close"
						onclick={() => (picker = null)}
						aria-label="close"
					>×</button>
				</div>
			</div>

			{#if picker === 'style'}
				<div class="picker-grid">
					{#each styles as s (s.id)}
						{@const preview = styleFor(s, name)}
						{@const active = s.id === styleId}
						<button
							type="button"
							class="picker-card"
							class:active
							onclick={() => pickStyle(s.id)}
						>
							<div class="picker-card-name">{s.name}</div>
							<div class="picker-card-preview">{preview}</div>
						</button>
					{/each}
				</div>
			{:else}
				<!-- Deco picker is grouped by category for scannability. -->
				<div class="picker-deco-scroll">
					{#each decosByCategory() as group (group.id)}
						{#if group.items.length > 0}
							<div class="picker-group-head">{group.label}</div>
							<div class="picker-grid">
								{#each group.items as d (d.id)}
									{@const active = d.id === decoId}
									<button
										type="button"
										class="picker-card"
										class:active
										onclick={() => pickDeco(d.id)}
									>
										<div class="picker-card-name">{d.pre} {d.post}</div>
										<div class="picker-card-preview">{decoPreview(d)}</div>
									</button>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.dock {
		position: fixed;
		left: 50%;
		bottom: 14px;
		transform: translateX(-50%);
		z-index: 95;
		max-width: min(820px, calc(100% - 24px));
		background: var(--card);
		color: var(--fg);
		border: 2px solid var(--fg);
		border-radius: 999px;
		padding: 6px 8px 6px 8px;
		box-shadow: 5px 5px 0 var(--fg);
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-sans);
	}

	.dock-pills {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.dock-tag {
		background: var(--accent);
		color: #0e0e10;
		border: 1.5px solid #0e0e10;
		border-radius: 999px;
		padding: 5px 22px 5px 10px;
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
		flex-shrink: 0;
		max-width: 130px;
		overflow: hidden;
		white-space: nowrap;
		line-height: 1;
		position: relative;
	}
	.dock-tag-deco {
		background: var(--card);
		color: var(--fg);
	}
	.dock-tag-label {
		text-overflow: ellipsis;
		overflow: hidden;
		display: inline-block;
		max-width: 100%;
		font-family: var(--font-mono);
	}
	.dock-tag-deco .dock-tag-label {
		/* Decoration glyphs are often non-Latin — serif fallback handles them better */
		font-family: serif;
		font-size: 12px;
		letter-spacing: 0;
		text-transform: none;
	}
	.dock-tag-label-soft {
		opacity: 0.6;
	}
	.dock-tag-caret {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%) rotate(180deg);
		font-size: 9px;
		transition: transform 0.15s ease;
	}
	.dock-tag.open .dock-tag-caret {
		transform: translateY(-50%) rotate(0deg);
	}

	.dock-io {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dock-input {
		flex: 0 1 auto;
		min-width: 80px;
		max-width: 200px;
		background: transparent;
		border: none;
		outline: none;
		padding: 6px 4px;
		font-family: var(--font-sans);
		font-size: 16px;
		color: var(--fg);
	}
	.dock-input::placeholder {
		color: var(--fg-soft);
		opacity: 0.6;
	}
	.dock-result {
		flex: 1;
		min-width: 0;
		font-family: serif;
		font-size: 18px;
		line-height: 1.2;
		color: var(--fg);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		border-left: 1px solid var(--line);
		padding-left: 10px;
	}

	.dock-btn {
		background: var(--fg);
		color: var(--bg);
		border: none;
		border-radius: 999px;
		padding: 8px 14px;
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.12s;
	}
	.dock-btn:hover {
		background: var(--accent);
		color: var(--fg);
	}
	.dock-btn-icon {
		background: transparent;
		color: var(--fg-soft);
		padding: 8px 10px;
		font-size: 14px;
	}
	.dock-btn-icon:hover {
		background: var(--fg);
		color: var(--bg);
	}

	/* --- Picker (shared by style + deco) --- */
	.picker-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in oklab, var(--fg) 30%, transparent);
		z-index: 96;
		backdrop-filter: blur(2px);
	}
	.picker {
		position: fixed;
		left: 50%;
		bottom: 80px;
		transform: translateX(-50%);
		z-index: 97;
		width: min(880px, calc(100% - 24px));
		max-height: 70vh;
		background: var(--card);
		color: var(--fg);
		border: 2px solid var(--fg);
		border-radius: 18px;
		box-shadow: 6px 6px 0 var(--fg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--font-sans);
	}
	.picker-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border-bottom: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-soft);
		flex-shrink: 0;
	}
	.picker-actions {
		display: flex;
		gap: 6px;
	}
	.picker-clear {
		background: transparent;
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 4px 10px;
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		color: var(--fg);
		cursor: pointer;
	}
	.picker-clear:hover {
		background: var(--fg);
		color: var(--bg);
	}
	.picker-close {
		background: var(--fg);
		color: var(--bg);
		border: none;
		border-radius: 999px;
		width: 28px;
		height: 28px;
		font-size: 16px;
		line-height: 1;
		cursor: pointer;
	}
	.picker-close:hover {
		background: var(--accent);
		color: var(--fg);
	}
	.picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 8px;
		padding: 14px;
		overflow-y: auto;
	}
	.picker-deco-scroll {
		overflow-y: auto;
	}
	.picker-group-head {
		padding: 12px 16px 4px;
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-soft);
		border-top: 1px solid var(--line);
	}
	.picker-deco-scroll .picker-group-head:first-child {
		border-top: none;
	}
	.picker-deco-scroll .picker-grid {
		padding-top: 4px;
		overflow: visible;
	}
	.picker-card {
		text-align: left;
		background: var(--card);
		color: var(--fg);
		border: 1.5px solid var(--line);
		border-radius: 12px;
		padding: 10px 12px;
		cursor: pointer;
		transition: transform 80ms ease, box-shadow 80ms ease, border-color 80ms ease;
	}
	.picker-card:hover {
		transform: translate(-1px, -1px);
		border-color: var(--fg);
		box-shadow: 3px 3px 0 var(--accent), 3px 3px 0 1px var(--fg);
	}
	.picker-card.active {
		border-color: var(--fg);
		background: color-mix(in oklab, var(--accent) 30%, var(--card));
		box-shadow: 3px 3px 0 var(--fg);
	}
	.picker-card-name {
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg-soft);
		margin-bottom: 4px;
	}
	.picker-card-preview {
		font-family: serif;
		font-size: 20px;
		line-height: 1.1;
		word-break: break-word;
		overflow-wrap: anywhere;
	}

	@media (max-width: 540px) {
		.dock {
			bottom: 10px;
			padding: 5px 6px 5px 6px;
			gap: 4px;
		}
		.dock-tag {
			max-width: 90px;
			padding: 5px 18px 5px 8px;
			font-size: 9px;
		}
		.dock-input {
			max-width: 140px;
		}
		.dock-result {
			font-size: 15px;
		}
		.picker {
			bottom: 72px;
			max-height: 60vh;
		}
	}
	@media (max-width: 420px) {
		/* Below ~iPhone SE width, hide the deco pill on the dock — user can
		   still get to it via the picker by tapping the style pill area (we
		   keep style pill since it's the primary tool). The full deco picker
		   is reachable from the Decorations page. */
		.dock-tag-deco {
			display: none;
		}
		.dock-tag:not(.dock-tag-deco) {
			max-width: 80px;
		}
		.dock-result {
			display: none;
		}
		.dock-btn {
			padding: 7px 10px;
		}
		.dock-dismiss {
			display: none;
		}
	}
</style>
