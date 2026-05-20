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
	style="padding: clamp(20px, 3vw, 48px) clamp(20px, 4vw, 56px) 28px; max-width: 1200px;"
>
	<!-- Eyebrow pill with pulsing dot -->
	<div
		class="inline-flex items-center gap-2"
		style="border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; font-family: var(--font-mono); font-size: 12px; text-transform: lowercase; color: var(--fg-soft);"
	>
		<span
			class="pulse-dot inline-block"
			style="width: 8px; height: 8px; border-radius: 999px; background: var(--accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 30%, transparent);"
			aria-hidden="true"
		></span>
		<span>the nickname generator that does too much</span>
	</div>

	<!-- Title -->
	<h1
		style="font-family: var(--font-display); font-size: clamp(36px, 5.2vw, 72px); line-height: 0.95; letter-spacing: -0.025em; text-wrap: balance; margin: 22px 0 18px;"
	>
		make your name
		<span class="cycle">
			<span class="cycle-var" aria-hidden="true">𝕗𝕒𝕟𝕔𝕪</span>
			<span class="cycle-var" aria-hidden="true">𝓯𝓪𝓷𝓬𝔂</span>
			<span class="cycle-var" aria-hidden="true">𝖋𝖆𝖓𝖈𝖞</span>
			<span class="cycle-var" aria-hidden="true">𝒻𝒶𝓃𝒸𝓎</span>
			<span class="cycle-var" aria-hidden="true">𝐟𝐚𝐧𝐜𝐲</span>
			<span class="sr-only">fancy</span>
		</span>
		<br />as hell.
	</h1>

	<!-- Subhead -->
	<p
		style="font-size: clamp(14px, 1.2vw, 16px); line-height: 1.5; color: var(--fg-soft); max-width: 520px; margin: 0 0 22px;"
	>
		type your name once. get {styleCount}+ styled versions. tap to copy. paste in your discord, your
		bio, your group chat, wherever.
	</p>

	<!-- Input cue: bouncing arrow + label. The empty input default makes this the
	     primary affordance — without it the input wouldn't read as "act here". -->
	{#if !name}
		<div
			class="input-cue"
			style="display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--fg); font-weight: 600; margin-bottom: 10px;"
		>
			<span class="input-cue-arrow" aria-hidden="true">↓</span>
			<span>type your name here</span>
		</div>
	{/if}

	<!-- Input card -->
	<div
		class="input-card"
		class:has-name={name}
		style="max-width: 720px; border: 2.5px solid var(--fg); border-radius: 18px; padding: 22px 24px 26px; background: var(--card); position: relative;"
	>
		<div
			style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-bottom: 4px;"
		>
			your name
		</div>
		<input
			type="text"
			value={name}
			maxlength={32}
			placeholder="type your username…"
			oninput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
			style="font-family: var(--font-display); font-size: clamp(28px, 4.5vw, 48px); background: transparent; border: none; outline: none; letter-spacing: -0.02em; width: 100%; color: var(--fg); padding: 0;"
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
						style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-soft); margin-top: 6px;"
					>
						{c.l}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	/* Idle pulse — swaps shadow to a layered accent+ink every 2.8s. The "obvious
	   cue" affordance that tells users where to start. Animation pauses when:
	   (a) the input is focused, or (b) the user has typed something. */
	.input-card {
		box-shadow: 8px 8px 0 var(--fg);
		transition: transform 0.15s ease, box-shadow 0.15s ease;
		animation: idle-glow 2.8s ease-in-out infinite;
	}
	.input-card.has-name,
	.input-card:focus-within {
		animation: none;
	}
	.input-card:focus-within {
		transform: translate(-2px, -2px);
		box-shadow:
			12px 12px 0 var(--accent),
			12px 12px 0 2.5px var(--fg);
	}
	@keyframes idle-glow {
		0%,
		100% {
			box-shadow: 8px 8px 0 var(--fg);
		}
		50% {
			box-shadow:
				8px 8px 0 var(--accent),
				8px 8px 0 2.5px var(--fg);
		}
	}

	.input-cue-arrow {
		display: inline-block;
		font-size: 20px;
		animation: bounce-down 1.2s ease-in-out infinite;
	}
	@keyframes bounce-down {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(5px);
		}
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
