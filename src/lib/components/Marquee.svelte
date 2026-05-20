<script lang="ts">
	const items = [
		'fancy fancy fancy',
		'✦ since whenever ✦',
		'made for the chronically online',
		'⌬ no signup ⌬',
		'free forever',
		'★彡 paste anywhere 彡★',
		'discord. twitch. bsky. wherever.',
		'𝓯𝓻𝓮𝓮 𝓯𝓸𝓻𝓮𝓿𝓮𝓻'
	];
	const tripled = [...items, ...items, ...items];
</script>

<!-- Background is always the bright accent (lime/pink/etc.); foreground stays dark
     ink regardless of theme so it's always readable on the saturated bg. -->
<div
	class="overflow-hidden"
	style="height: 38px; background: var(--accent); border-bottom: 2px solid #0e0e10;"
>
	<div class="marquee-track h-full items-center">
		{#each tripled as item, i (i)}
			<span
				class="px-3"
				style="font-family: var(--font-display); font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: #0e0e10;"
			>
				{item}
			</span>
			<span class="px-1" style="color: #0e0e10; opacity: 0.6;">●</span>
		{/each}
	</div>
</div>
