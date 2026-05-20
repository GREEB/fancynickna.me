<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { nickName, nickStyleId } from '$lib/stores/nick';
	import { styles } from '$lib/fancyText';

	let dismissed = $state(false);
	let pickerOpen = $state(false);

	const styleById = $derived(new Map(styles.map((s) => [s.id, s])));

	let name = $state('');
	let styleId = $state('');
	const unsubName = nickName.subscribe((v) => (name = v));
	const unsubStyle = nickStyleId.subscribe((v) => (styleId = v));
	onDestroy(() => {
		unsubName();
		unsubStyle();
	});

	const chosenStyle = $derived(styleId ? styleById.get(styleId) : undefined);

	function styledFor(s: { fn: (input: string) => string } | undefined, raw: string): string {
		const n = raw.trim() || 'YourName';
		if (!s) return n;
		try {
			return s.fn(n);
		} catch {
			return n;
		}
	}

	function styledValue(): string {
		return styledFor(chosenStyle, name);
	}

	const hasContent = $derived(name.trim().length > 0 || styleId !== '');

	async function copyStyled() {
		try {
			await navigator.clipboard.writeText(styledValue());
			toast(`copied "${chosenStyle?.name ?? 'plain'}"`);
		} catch {
			toast('copy failed');
		}
	}

	function clearAll() {
		nickName.set('');
		nickStyleId.set('');
	}

	function onInput(e: Event) {
		nickName.set((e.currentTarget as HTMLInputElement).value);
	}

	function pickStyle(id: string) {
		nickStyleId.set(id);
		pickerOpen = false;
	}

	function clearStyle() {
		nickStyleId.set('');
		pickerOpen = false;
	}
</script>

{#if hasContent && !dismissed}
	<aside class="dock" role="region" aria-label="Your saved nickname">
		<button
			type="button"
			class="dock-tag"
			class:open={pickerOpen}
			title="click to change style"
			onclick={() => (pickerOpen = !pickerOpen)}
		>
			{#if chosenStyle}
				<span class="dock-tag-label">{chosenStyle.name}</span>
			{:else}
				<span class="dock-tag-label dock-tag-label-soft">plain</span>
			{/if}
			<span class="dock-tag-caret" aria-hidden="true">▴</span>
		</button>

		<input
			class="dock-input"
			value={name}
			placeholder="your name"
			maxlength="40"
			autocomplete="off"
			spellcheck="false"
			oninput={onInput}
		/>

		<button type="button" class="dock-btn" onclick={copyStyled} title="copy">copy</button>
		<button type="button" class="dock-btn dock-btn-icon" onclick={clearAll} title="clear">×</button>
		<button
			type="button"
			class="dock-btn dock-btn-icon dock-dismiss"
			onclick={() => (dismissed = true)}
			title="hide for this session"
		>—</button>
	</aside>

	{#if pickerOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="picker-backdrop" onclick={() => (pickerOpen = false)}></div>
		<div class="picker" role="dialog" aria-label="Pick a style">
			<div class="picker-head">
				<span>pick a style</span>
				<div class="picker-actions">
					<button type="button" class="picker-clear" onclick={clearStyle}>plain</button>
					<button
						type="button"
						class="picker-close"
						onclick={() => (pickerOpen = false)}
						aria-label="close"
					>×</button>
				</div>
			</div>
			<div class="picker-grid">
				{#each styles as s (s.id)}
					{@const preview = styledFor(s, name)}
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
		max-width: min(720px, calc(100% - 24px));
		background: var(--card);
		color: var(--fg);
		border: 2px solid var(--fg);
		border-radius: 999px;
		padding: 6px 8px 6px 14px;
		box-shadow: 5px 5px 0 var(--fg);
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-sans);
	}

	.dock-tag {
		background: var(--accent);
		color: #0e0e10;
		border: 1.5px solid #0e0e10;
		border-radius: 999px;
		padding: 5px 28px 5px 10px;
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
		flex-shrink: 0;
		max-width: 160px;
		overflow: hidden;
		white-space: nowrap;
		line-height: 1;
		position: relative;
	}
	.dock-tag-label {
		text-overflow: ellipsis;
		overflow: hidden;
		display: inline-block;
		max-width: 100%;
	}
	.dock-tag-label-soft {
		opacity: 0.6;
	}
	.dock-tag-caret {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%) rotate(180deg);
		font-size: 9px;
		transition: transform 0.15s ease;
	}
	.dock-tag.open .dock-tag-caret {
		transform: translateY(-50%) rotate(0deg);
	}

	.dock-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		outline: none;
		padding: 6px;
		font-family: var(--font-sans);
		font-size: 16px;
		color: var(--fg);
	}
	.dock-input::placeholder {
		color: var(--fg-soft);
		opacity: 0.6;
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

	/* --- Style picker --- */
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
			padding: 5px 6px 5px 10px;
			gap: 6px;
		}
		.dock-tag {
			max-width: 110px;
		}
		.picker {
			bottom: 72px;
			max-height: 60vh;
		}
	}
	@media (max-width: 420px) {
		/* Below ~iPhone SE width the row is too cramped — drop the dismiss button
		   to give the input space. The × clear button is enough to reset. */
		.dock-tag {
			max-width: 80px;
			padding: 5px 24px 5px 8px;
		}
		.dock-btn {
			padding: 7px 10px;
		}
		.dock-dismiss {
			display: none;
		}
	}
</style>
