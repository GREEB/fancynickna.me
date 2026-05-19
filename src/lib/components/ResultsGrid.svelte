<script lang="ts">
	import NickCard from './NickCard.svelte';
	import type { FancyStyle, DecoPack } from '$lib/fancyText';

	interface Props {
		name: string;
		styles: FancyStyle[];
		deco: DecoPack;
		applyDeco: boolean;
		tick: number;
		copiedId: string | null;
		onCopy: (id: string, name: string, value: string) => void;
	}
	let { name, styles, deco, applyDeco, tick, copiedId, onCopy }: Props = $props();

	const safeName = $derived(name.trim() || 'YourName');

	function renderValue(style: FancyStyle): string {
		// `tick` is referenced so glitch styles re-render
		void tick;
		const base = style.fn(safeName);
		return applyDeco ? deco.pre + base + deco.post : base;
	}
</script>

<section
	style="padding: 50px clamp(20px, 4vw, 56px) 80px; border-top: 2px solid var(--fg);"
>
	<div class="flex items-baseline justify-between flex-wrap" style="gap: 16px; margin-bottom: 28px;">
		<h2
			style="font-family: var(--font-display); font-size: clamp(32px, 5vw, 56px); letter-spacing: -0.02em; margin: 0;"
		>
			all the styles.
		</h2>
		<div
			style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft);"
		>
			tap any card · copies instantly
		</div>
	</div>

	<div
		class="cards"
		style="display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
	>
		{#each styles as style, i (style.id)}
			<NickCard
				index={i}
				styleName={style.name}
				value={renderValue(style)}
				copied={copiedId === style.id}
				onCopy={() => onCopy(style.id, style.name, renderValue(style))}
			/>
		{/each}
	</div>
</section>
