<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte';
	import { afterNavigate } from '$app/navigation';

	let menuOpen = $state(false);

	// Auto-close the mobile menu on route change.
	afterNavigate(() => (menuOpen = false));

	const navLinks = [
		{ href: '/styles', label: 'styles' },
		{ href: '/advanced', label: 'advanced' },
		{ href: '/decorations', label: 'deco' },
		{ href: '/3d', label: '3d' },
		{ href: '/symbols', label: 'symbols' },
		{ href: '/games', label: 'games' }
	];
</script>

<header
	class="flex items-center justify-between"
	style="padding: 14px clamp(16px, 4vw, 56px); border-bottom: 1px solid var(--line); position: relative; gap: 12px;"
>
	<a href="/" class="flex items-center gap-[10px] no-underline" style="color: var(--fg); flex-shrink: 0;">
		<span
			style="font-size: 26px; color: var(--accent); -webkit-text-stroke: 1.5px var(--fg); line-height: 1;"
			aria-hidden="true">✶</span
		>
		<span style="font-family: var(--font-display); font-size: 20px; letter-spacing: -0.01em;">
			fancynickna<span style="color: var(--accent); -webkit-text-stroke: 1px var(--fg);">.</span>me
		</span>
	</a>

	<!-- Desktop nav: visible above sm (640px) -->
	<nav class="hidden sm:flex items-center" style="gap: 22px;">
		{#each navLinks as l (l.href)}
			<a
				href={l.href}
				style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--fg-soft); text-decoration: none;"
				onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg)')}
				onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-soft)')}>{l.label}</a
			>
		{/each}
		<ThemeToggle />
		<a
			href="/about"
			style="background: var(--fg); color: var(--bg); padding: 10px 16px; border-radius: 999px; font-weight: 600; font-size: 14px; text-decoration: none; font-family: var(--font-sans);"
			onmouseenter={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'var(--accent)';
				(e.currentTarget as HTMLElement).style.color = 'var(--fg)';
			}}
			onmouseleave={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'var(--fg)';
				(e.currentTarget as HTMLElement).style.color = 'var(--bg)';
			}}>about →</a
		>
	</nav>

	<!-- Mobile: just the toggle + hamburger so theme is still reachable -->
	<div class="flex sm:hidden items-center" style="gap: 8px;">
		<ThemeToggle />
		<button
			type="button"
			class="burger"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span class="burger-lines" class:open={menuOpen} aria-hidden="true">
				<span></span><span></span><span></span>
			</span>
		</button>
	</div>
</header>

{#if menuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="mobile-menu-backdrop" onclick={() => (menuOpen = false)}></div>
	<nav class="mobile-menu" aria-label="Mobile navigation">
		{#each navLinks as l (l.href)}
			<a href={l.href} class="mobile-link">{l.label}</a>
		{/each}
		<a href="/about" class="mobile-link mobile-link-cta">about →</a>
	</nav>
{/if}

<style>
	.burger {
		background: transparent;
		border: 1px solid var(--line);
		border-radius: 999px;
		width: 40px;
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.burger:hover {
		border-color: var(--fg);
	}
	.burger-lines {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 16px;
		height: 11px;
	}
	.burger-lines span {
		display: block;
		height: 1.5px;
		background: var(--fg);
		border-radius: 999px;
		transform-origin: center;
		transition: transform 0.15s ease, opacity 0.15s ease;
	}
	.burger-lines.open span:nth-child(1) {
		transform: translateY(4.5px) rotate(45deg);
	}
	.burger-lines.open span:nth-child(2) {
		opacity: 0;
	}
	.burger-lines.open span:nth-child(3) {
		transform: translateY(-4.5px) rotate(-45deg);
	}

	.mobile-menu-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in oklab, var(--fg) 25%, transparent);
		backdrop-filter: blur(2px);
		z-index: 60;
	}
	.mobile-menu {
		position: fixed;
		top: 64px;
		left: 12px;
		right: 12px;
		z-index: 61;
		background: var(--card);
		border: 2px solid var(--fg);
		border-radius: 16px;
		box-shadow: 6px 6px 0 var(--fg);
		padding: 14px;
		display: grid;
		gap: 4px;
	}
	.mobile-link {
		display: block;
		padding: 12px 14px;
		font-family: var(--font-sans);
		font-size: 16px;
		font-weight: 500;
		color: var(--fg);
		text-decoration: none;
		border-radius: 10px;
		transition: background 0.12s;
	}
	.mobile-link:hover,
	.mobile-link:focus-visible {
		background: color-mix(in oklab, var(--fg) 6%, transparent);
	}
	.mobile-link-cta {
		background: var(--fg);
		color: var(--bg);
		font-weight: 600;
		margin-top: 6px;
		text-align: center;
	}
	.mobile-link-cta:hover {
		background: var(--accent);
		color: var(--fg);
	}
</style>
