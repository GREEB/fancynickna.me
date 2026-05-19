<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer
	style="padding: 60px clamp(20px, 4vw, 56px) 30px; border-top: 2px solid var(--fg);"
>
	<div
		style="font-family: var(--font-display); font-size: clamp(70px, 16vw, 240px); line-height: 1; letter-spacing: -0.04em; -webkit-text-stroke: 2px var(--fg); color: transparent; user-select: none;"
		aria-hidden="true"
	>
		fancynickna.me
	</div>
	<div
		class="flex flex-wrap items-center"
		style="gap: 14px; margin-top: 24px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; color: var(--fg-soft);"
	>
		<span>© {year}</span>
		<span style="opacity: 0.5;">●</span>
		<span>made with too much time</span>
		<span style="opacity: 0.5;">●</span>
		<span style="color: var(--accent);">v0.1</span>
	</div>
</footer>
