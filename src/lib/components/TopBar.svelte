<script lang="ts"></script>

<header
	class="flex items-center justify-between"
	style="padding: 22px clamp(20px, 4vw, 56px); border-bottom: 1px solid var(--line);"
>
	<a href="/" class="flex items-center gap-[10px] no-underline" style="color: var(--fg);">
		<span
			style="font-size: 26px; color: var(--accent); -webkit-text-stroke: 1.5px var(--fg); line-height: 1;"
			aria-hidden="true">✶</span
		>
		<span style="font-family: var(--font-display); font-size: 22px; letter-spacing: -0.01em;">
			fancynickna<span style="color: var(--accent); -webkit-text-stroke: 1px var(--fg);">.</span>me
		</span>
	</a>

	<nav class="flex items-center" style="gap: 26px;">
		<a
			href="/styles"
			class="hidden sm:inline"
			style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--fg-soft); text-decoration: none;"
			onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
			onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-soft)')}>styles</a
		>
		<a
			href="/symbols"
			class="hidden sm:inline"
			style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--fg-soft); text-decoration: none;"
			onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
			onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-soft)')}
			>symbols</a
		>
		<a
			href="/about"
			class="hidden sm:inline"
			style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--fg-soft); text-decoration: none;"
			onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
			onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-soft)')}>about</a
		>
		<a
			href="/api"
			style="background: var(--fg); color: var(--bg); padding: 10px 16px; border-radius: 999px; font-weight: 600; font-size: 14px; text-decoration: none; font-family: var(--font-sans);"
			onmouseenter={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'var(--accent)';
				(e.currentTarget as HTMLElement).style.color = 'var(--fg)';
			}}
			onmouseleave={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'var(--fg)';
				(e.currentTarget as HTMLElement).style.color = 'var(--bg)';
			}}>use the api →</a
		>
	</nav>
</header>
