import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const url = env.DATABASE_URL;

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
