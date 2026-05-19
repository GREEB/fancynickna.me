<script lang="ts">
	interface Props {
		onPick: (s: string) => void;
	}
	let { onPick }: Props = $props();
	const chips = ['Maya', 'kai', 'Ren', '404', 'voidbabe', 'goblin', 'tofu', 'cherry', 'glitch', 'mochi'];
</script>

<div
	class="flex flex-wrap items-center"
	style="padding: 0 clamp(20px, 4vw, 56px) 50px; gap: 8px;"
>
	<span
		style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft);"
		>try:</span
	>
	{#each chips as c (c)}
		<button
			onclick={() => onPick(c)}
			style="border: 1px solid var(--line); padding: 8px 14px; border-radius: 999px; font-size: 13px; background: transparent; color: var(--fg); cursor: pointer; transition: all 0.12s ease;"
			onmouseenter={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'var(--fg)';
				(e.currentTarget as HTMLElement).style.color = 'var(--bg)';
				(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
			}}
			onmouseleave={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'transparent';
				(e.currentTarget as HTMLElement).style.color = 'var(--fg)';
				(e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
			}}>{c}</button
		>
	{/each}
</div>
