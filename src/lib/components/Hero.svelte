<script lang="ts">
	interface Props {
		name: string;
		styleCount: number;
		decoCount: number;
		showCount?: boolean;
		onInput: (value: string) => void;
		onClear: () => void;
	}
	let { name = $bindable(''), styleCount, decoCount, showCount = true, onInput, onClear }: Props =
		$props();
</script>

<section
	style="padding: clamp(40px, 7vw, 100px) clamp(20px, 4vw, 56px) 40px; max-width: 1200px;"
>
	<!-- Eyebrow -->
	<div
		class="inline-flex items-center gap-2"
		style="border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; font-family: var(--font-mono); font-size: 12px; text-transform: lowercase; color: var(--fg-soft);"
	>
		<span
			class="pulse-dot inline-block"
			style="width: 8px; height: 8px; border-radius: 999px; background: var(--accent);"
			aria-hidden="true"
		></span>
		<span>the nickname generator that does too much</span>
	</div>

	<!-- Title -->
	<h1
		style="font-family: var(--font-display); font-size: clamp(48px, 9vw, 130px); line-height: 0.92; letter-spacing: -0.025em; text-wrap: balance; margin: 24px 0 18px;"
	>
		make your name
		<span style="position: relative; display: inline-block; min-width: 5ch;">
			<span class="cycle-var" aria-hidden="true">𝕗𝕒𝕟𝕔𝕪</span>
			<span class="cycle-var" aria-hidden="true">𝓯𝓪𝓷𝓬𝔂</span>
			<span class="cycle-var" style="color: var(--accent);" aria-hidden="true">꧁ＦＡＮＣＹ꧂</span>
			<span class="sr-only">fancy</span>
		</span>
		<br />as hell.
	</h1>

	<!-- Subhead -->
	<p
		style="font-size: clamp(15px, 1.4vw, 18px); line-height: 1.5; color: var(--fg-soft); max-width: 580px; margin: 0 0 32px;"
	>
		type your name once. get {styleCount}+ styled versions. tap to copy. paste in your discord, your
		bio, your group chat, wherever.
	</p>

	<!-- Input card -->
	<div
		class="input-card shadow-brut"
		style="max-width: 640px; border: 2px solid var(--fg); border-radius: 18px; padding: 18px 22px; background: var(--card); position: relative; transition: transform 0.15s ease, box-shadow 0.15s ease;"
	>
		<div
			style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 8px;"
		>
			your name
		</div>
		<input
			type="text"
			value={name}
			maxlength={32}
			placeholder="type something..."
			oninput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
			style="font-family: var(--font-display); font-size: clamp(28px, 4.5vw, 48px); background: transparent; border: none; outline: none; letter-spacing: -0.02em; width: 100%; color: var(--fg);"
		/>
		{#if name}
			<button
				onclick={onClear}
				style="position: absolute; right: 18px; bottom: 18px; border: 1px solid var(--line); padding: 6px 12px; border-radius: 999px; font-family: var(--font-mono); font-size: 12px; color: var(--fg-soft); background: transparent; cursor: pointer;"
				onmouseenter={(e) => {
					(e.currentTarget as HTMLElement).style.background = 'var(--fg)';
					(e.currentTarget as HTMLElement).style.color = 'var(--bg)';
				}}
				onmouseleave={(e) => {
					(e.currentTarget as HTMLElement).style.background = 'transparent';
					(e.currentTarget as HTMLElement).style.color = 'var(--fg-soft)';
				}}>clear</button
			>
		{/if}
	</div>

	{#if showCount}
		<div
			class="flex flex-wrap"
			style="gap: clamp(20px, 4vw, 56px); margin-top: 36px;"
		>
			{#each [
				{ n: `${styleCount}`, l: 'styles' },
				{ n: `${decoCount}`, l: 'deco packs' },
				{ n: '32', l: 'char limit' },
				{ n: '∞', l: 'free uses' }
			] as c (c.l)}
				<div>
					<div
						style="font-family: var(--font-display); font-size: clamp(28px, 4vw, 44px); line-height: 1;"
					>
						{c.n}
					</div>
					<div
						style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-top: 4px;"
					>
						{c.l}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.input-card:focus-within {
		transform: translate(-2px, -2px);
		box-shadow:
			10px 10px 0 var(--accent),
			10px 10px 0 2px var(--fg);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
