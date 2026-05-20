// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Vite asset import suffixes — TS doesn't know about them out of the box,
// so we declare the ones we use (just `?inline` so far, for the OG font).
declare module '*.ttf?inline' {
	const dataUrl: string;
	export default dataUrl;
}

export {};
