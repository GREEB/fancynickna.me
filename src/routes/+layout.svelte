<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { afterNavigate } from '$app/navigation';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import DockedBar from '$lib/components/DockedBar.svelte';
	let { children } = $props();

	// SPA pageview: gtag's initial config call is set to `send_page_view: false`
	// in app.html, so we fire page_view manually on every navigation including
	// the first. Consent Mode handles whether the event actually leaves the
	// browser — if the user hasn't accepted, GA queues it and drops it.
	afterNavigate(({ to }) => {
		if (typeof window === 'undefined' || !to) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const w = window as any;
		if (typeof w.gtag !== 'function') return;
		w.gtag('event', 'page_view', {
			page_path: to.url.pathname + to.url.search,
			page_location: to.url.href,
			page_title: document.title
		});
	});
</script>

{@render children()}

<DockedBar />

<ConsentBanner />

<Toaster
	position="top-center"
	toastOptions={{
		style:
			'background: var(--fg); color: var(--bg); border-radius: 999px; padding: 12px 20px; font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.02em; box-shadow: 0 8px 24px rgba(0,0,0,0.18); border: none;'
	}}
/>
