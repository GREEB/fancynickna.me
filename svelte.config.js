import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Vercel adapter. Default runtime is Node (serverless functions), which is
		// the right choice here — the bundled JSON data lives in the function
		// bundle and we get full SSR semantics.
		adapter: adapter({
			runtime: 'nodejs20.x',
			// One serverless function per route. Without this, every page goes
			// through one big function whose bundle contains every JSON we ship —
			// so /symbols (which only needs blocks.json, ~50KB) pays the cost of
			// parsing characters.json (19MB) on every cold start.
			split: true
		}),
		alias: {
			$lib: 'src/lib'
		},
		prerender: {
			handleHttpError: 'warn',
			// Make `url.origin` resolve to the production URL during prerender so
			// sitemap files generated at build time have correct absolute URLs.
			origin: 'https://fancynickna.me'
		}
	}
};

export default config;
