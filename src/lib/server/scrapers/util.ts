export function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/['']/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 100);
}

export async function fetchWithRetry(url: string, init: RequestInit = {}, attempts = 4): Promise<Response> {
	let lastErr: unknown;
	for (let i = 0; i < attempts; i++) {
		try {
			const res = await fetch(url, init);
			if (res.status === 429 || res.status >= 500) {
				await sleep(2 ** i * 500);
				continue;
			}
			return res;
		} catch (e) {
			lastErr = e;
			await sleep(2 ** i * 500);
		}
	}
	throw lastErr ?? new Error(`fetch failed after ${attempts} attempts: ${url}`);
}

export function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

export async function batched<T>(items: T[], size: number, fn: (batch: T[], idx: number) => Promise<void>) {
	for (let i = 0; i < items.length; i += size) {
		await fn(items.slice(i, i + size), i / size);
	}
}
