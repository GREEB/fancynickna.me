<script lang="ts">
	import { onMount } from 'svelte';

	// Three states: 'auto' follows OS, 'cream' is the light brand theme, 'ink' is dark.
	// The actual `data-theme` attribute is set by an inline script in app.html
	// before paint; this component keeps in sync and lets the user override.
	type Mode = 'auto' | 'cream' | 'ink';

	let mode = $state<Mode>('auto');
	let mounted = $state(false);

	function effectiveFor(m: Mode): 'cream' | 'ink' {
		if (m === 'auto') {
			return typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'ink'
				: 'cream';
		}
		return m;
	}

	function applyMode(m: Mode) {
		const eff = effectiveFor(m);
		document.documentElement.setAttribute('data-theme', eff);
		// Update the browser chrome color to match too
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', eff === 'ink' ? '#0e0e10' : '#f5f2ea');
	}

	function setMode(next: Mode) {
		mode = next;
		try {
			if (next === 'auto') localStorage.removeItem('theme');
			else localStorage.setItem('theme', next);
		} catch {
			/* private mode etc */
		}
		applyMode(next);
	}

	function cycle() {
		const order: Mode[] = ['auto', 'cream', 'ink'];
		setMode(order[(order.indexOf(mode) + 1) % order.length]);
	}

	onMount(() => {
		try {
			const stored = (localStorage.getItem('theme') as Mode | null) ?? 'auto';
			mode = stored;
		} catch {
			mode = 'auto';
		}
		mounted = true;

		// When in auto mode, follow the OS preference live.
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = () => {
			if (mode === 'auto') applyMode('auto');
		};
		if (mq.addEventListener) mq.addEventListener('change', onChange);
		else mq.addListener(onChange);
		return () => {
			if (mq.removeEventListener) mq.removeEventListener('change', onChange);
			else mq.removeListener(onChange);
		};
	});

	const label = $derived(
		mode === 'auto' ? 'theme: auto' : mode === 'ink' ? 'theme: dark' : 'theme: light'
	);
	const icon = $derived(mode === 'auto' ? '◐' : mode === 'ink' ? '☾' : '☀');
</script>

<button
	type="button"
	onclick={cycle}
	aria-label={label}
	title={`${label} · click to cycle`}
	class="theme-toggle"
>
	<span class="theme-icon" aria-hidden="true">{mounted ? icon : '◐'}</span>
	<span class="theme-label hidden sm:inline">{mode}</span>
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--line);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: lowercase;
		cursor: pointer;
		line-height: 1;
		transition: border-color 80ms ease, background 80ms ease;
	}
	.theme-toggle:hover {
		border-color: var(--fg);
		background: color-mix(in srgb, var(--fg) 6%, transparent);
	}
	.theme-icon {
		font-size: 14px;
		line-height: 1;
	}
</style>
