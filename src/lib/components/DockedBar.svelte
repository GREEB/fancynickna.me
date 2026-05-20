<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { nickName, nickStyleId } from '$lib/stores/nick';
	import { styles } from '$lib/fancyText';

	let dismissed = $state(false);

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

	function styledValue(): string {
		const n = name.trim() || 'YourName';
		if (!chosenStyle) return n;
		try {
			return chosenStyle.fn(n);
		} catch {
			return n;
		}
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
</script>

{#if hasContent && !dismissed}
	<aside class="dock" role="region" aria-label="Your saved nickname">
		<button
			type="button"
			class="dock-tag"
			title={chosenStyle ? `style: ${chosenStyle.name}` : 'no style — pick one on /styles or the home grid'}
			onclick={copyStyled}
		>
			{#if chosenStyle}
				<span class="dock-tag-label">{chosenStyle.name}</span>
			{:else}
				<span class="dock-tag-label dock-tag-label-soft">plain</span>
			{/if}
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
			class="dock-btn dock-btn-icon"
			onclick={() => (dismissed = true)}
			title="hide for this session"
		>—</button>
	</aside>
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
		/* Accent bg → pin fg to ink regardless of theme so it stays readable */
		color: #0e0e10;
		border: 1.5px solid #0e0e10;
		border-radius: 999px;
		padding: 5px 10px;
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
		flex-shrink: 0;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1;
	}
	.dock-tag-label-soft {
		opacity: 0.6;
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

	@media (max-width: 540px) {
		.dock {
			bottom: 10px;
			padding: 5px 6px 5px 10px;
			gap: 6px;
		}
		.dock-tag {
			max-width: 90px;
		}
	}
</style>
