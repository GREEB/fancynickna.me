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

<svelte:head>
	<!-- Shared social/SEO defaults. Per-page <svelte:head> can override
	     anything individual (og:title, og:image, etc.) but these baseline
	     properties stay constant: locale, site name, logo, brand color. -->
	<meta property="og:site_name" content="fancynickna.me" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:logo" content="https://fancynickna.me/icon-512.png" />
	<meta name="twitter:site" content="@fancynickname" />
	<meta name="application-name" content="fancynickna.me" />
</svelte:head>

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
