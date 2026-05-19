import adapter from 'svelte-adapter-bun';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: { brotli: true, gzip: true },
			development: false
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
