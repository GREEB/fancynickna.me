<script lang="ts">
	const items = [
		{ q: 'is it free?', a: 'yes. forever. no signup. no ads. no tracking.' },
		{
			q: 'will it work on discord/insta/tiktok?',
			a: 'most styles, yes. some platforms strip combining characters — try a different style if one breaks.'
		},
		{
			q: 'is it actually a font?',
			a: 'nope — unicode characters that look like fonts. that\'s why they work in places where you can\'t change the font.'
		},
		{
			q: 'can i use the glitch one in my username?',
			a: 'sometimes. try it. worst case it gets rejected and you pick another.'
		}
	];
</script>

<section
	style="padding: 60px clamp(20px, 4vw, 56px); border-top: 2px solid var(--fg); background: color-mix(in oklab, var(--fg) 4%, var(--bg));"
>
	<h2
		style="font-family: var(--font-display); font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em; margin: 0 0 24px;"
	>
		questions you're definitely asking
	</h2>
	<div style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
		{#each items as item (item.q)}
			<div>
				<div style="font-family: var(--font-display); font-size: 17px; margin-bottom: 8px;">{item.q}</div>
				<div style="font-size: 14.5px; color: var(--fg-soft); line-height: 1.5;">{item.a}</div>
			</div>
		{/each}
	</div>
</section>
