<script lang="ts">
	import { onMount } from 'svelte';

	// `consent` lives in localStorage as 'granted' | 'denied'. Missing = haven't
	// asked yet; show the banner. The default consent state in app.html is
	// 'denied' until the user accepts here, so analytics is gated until then.
	let state = $state<'pending' | 'granted' | 'denied'>('pending');

	function gtag(...args: unknown[]) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).dataLayer?.push(args);
	}

	onMount(() => {
		try {
			const stored = localStorage.getItem('consent') as 'granted' | 'denied' | null;
			if (stored === 'granted' || stored === 'denied') state = stored;
		} catch {
			/* private mode */
		}
	});

	function accept() {
		state = 'granted';
		try {
			localStorage.setItem('consent', 'granted');
		} catch {}
		gtag('consent', 'update', { analytics_storage: 'granted' });
	}

	function reject() {
		state = 'denied';
		try {
			localStorage.setItem('consent', 'denied');
		} catch {}
		gtag('consent', 'update', { analytics_storage: 'denied' });
	}
</script>

{#if state === 'pending'}
	<div
		role="dialog"
		aria-label="Cookie consent"
		aria-live="polite"
		class="consent"
	>
		<p class="consent-msg">
			This site uses anonymous analytics (Google Analytics 4) to see which styles and pages get
			used. No accounts, no ads, no fingerprinting — just aggregate pageviews.
		</p>
		<div class="consent-actions">
			<button type="button" class="consent-btn" onclick={reject}>no thanks</button>
			<button type="button" class="consent-btn primary" onclick={accept}>accept</button>
		</div>
	</div>
{/if}

<style>
	.consent {
		position: fixed;
		left: 50%;
		bottom: 16px;
		transform: translateX(-50%);
		z-index: 200;
		max-width: min(560px, calc(100% - 24px));
		background: var(--card);
		color: var(--fg);
		border: 2px solid var(--fg);
		border-radius: 16px;
		padding: 16px 18px;
		box-shadow: 6px 6px 0 var(--fg);
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
		font-family: var(--font-sans);
	}
	.consent-msg {
		flex: 1 1 280px;
		margin: 0;
		font-size: 13px;
		line-height: 1.45;
		color: var(--fg);
	}
	.consent-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}
	.consent-btn {
		padding: 9px 16px;
		font-family: var(--font-mono);
		font-size: 12px;
		text-transform: lowercase;
		letter-spacing: 0.04em;
		border-radius: 999px;
		border: 1.5px solid var(--fg);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
	}
	.consent-btn:hover {
		background: var(--fg);
		color: var(--bg);
	}
	.consent-btn.primary {
		background: var(--fg);
		color: var(--bg);
	}
	.consent-btn.primary:hover {
		background: var(--accent);
		color: var(--fg);
		border-color: var(--fg);
	}
</style>
