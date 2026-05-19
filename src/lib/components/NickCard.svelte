<script lang="ts">
	interface Props {
		index: number;
		styleName: string;
		value: string;
		copied: boolean;
		onCopy: () => void;
	}
	let { index, styleName, value, copied, onCopy }: Props = $props();
	const num = String(index + 1).padStart(2, '0');
</script>

<button
	class="nick-card group"
	class:copied
	onclick={onCopy}
	style="background: {copied ? 'var(--accent)' : 'var(--card)'}; border: 1.5px solid var(--fg); border-radius: 14px; padding: 16px 18px; min-height: 110px; display: flex; flex-direction: column; gap: 14px; text-align: left; cursor: pointer; transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease;"
>
	<div
		class="flex items-center"
		style="gap: 10px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;"
	>
		<span style="font-weight: 600; color: var(--fg);">#{num}</span>
		<span style="flex: 1; color: var(--fg-soft);">{styleName}</span>
		<span class="status" style="color: var(--fg-soft); font-weight: {copied ? 700 : 400};">
			{copied ? 'copied!' : 'tap to copy'}
		</span>
	</div>
	<div
		style="font-family: serif; font-size: clamp(20px, 2.2vw, 30px); line-height: 1.15; word-break: break-word; overflow-wrap: anywhere; color: var(--fg);"
	>
		{value}
	</div>
</button>

<style>
	.nick-card:hover {
		transform: translate(-2px, -2px);
		box-shadow:
			4px 4px 0 var(--accent),
			4px 4px 0 1.5px var(--fg);
	}
	.nick-card:hover .status {
		color: var(--fg);
	}
	.nick-card:active {
		transform: translate(0, 0);
		box-shadow: none;
	}
</style>
