// The canvas/three.js init runs in onMount (client-only) so SSR is fine —
// keeping it on lets crawlers see the <svelte:head> meta tags. Don't prerender
// because the page is interactive-only beyond the static head.
export const prerender = false;
