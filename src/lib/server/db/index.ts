import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// SvelteKit/Vite exposes runtime env via $env/dynamic/private (Vite doesn't
// populate process.env from .env files). Bare Bun scripts can't resolve that
// virtual module — they load .env themselves via dotenv, so process.env works.
let url: string | undefined;
try {
	const mod = await import(/* @vite-ignore */ '$env/dynamic/private');
	url = mod.env.DATABASE_URL;
} catch {
	url = process.env.DATABASE_URL;
}

const client = url
	? postgres(url, { max: 10, prepare: false })
	: (null as unknown as ReturnType<typeof postgres>);

export const db = url
	? drizzle(client, { schema })
	: (new Proxy(
			{},
			{
				get() {
					throw new Error('DATABASE_URL is not set — db client unavailable');
				}
			}
		) as ReturnType<typeof drizzle<typeof schema>>);

export { schema };
