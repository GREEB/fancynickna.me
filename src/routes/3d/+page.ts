// three.js inits in onMount client-side, so the HTML is identical for every
// visitor — prerender it to a static file. Crawlers still see all the meta tags.
export const prerender = true;
