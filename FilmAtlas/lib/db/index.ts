import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | null = null;

function connect(): Database {
  if (instance) return instance;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy the pooled connection string from your Neon project into .env.local.'
    );
  }

  instance = drizzle(neon(url), { schema });
  return instance;
}

/**
 * Connects on first use rather than at import.
 *
 * `next build` imports every route module to collect metadata, so connecting
 * eagerly would make the build fail on any machine without DATABASE_URL — CI
 * included — even though nothing actually queries at build time.
 */
export const db = new Proxy({} as Database, {
  get: (_target, property, receiver) =>
    Reflect.get(connect() as object, property, receiver),
});

export { schema };
