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
			runtime: 'nodejs20.x'
		}),
		alias: {
			$lib: 'src/lib'
		},
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
