// Global name + selected style state. Persists across page navigations and
// across browser sessions via localStorage. The DockedBar reads from here so
// the user's choice follows them wherever they go on the site.

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

function persisted(key: string, fallback = ''): Writable<string> {
	const initial = browser ? localStorage.getItem(key) ?? fallback : fallback;
	const store = writable<string>(initial);
	if (browser) {
		store.subscribe((v) => {
			try {
				if (v === '') localStorage.removeItem(key);
				else localStorage.setItem(key, v);
			} catch {
				/* private mode */
			}
		});
	}
	return store;
}

export const nickName = persisted('nick.name');
export const nickStyleId = persisted('nick.styleId');
export const nickDecoId = persisted('nick.decoId');
