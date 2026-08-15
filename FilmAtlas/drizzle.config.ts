import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Next.js reads .env.local automatically; drizzle-kit runs outside Next, so load it here.
config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // neon_auth is owned by Neon Auth; including it here stops drizzle-kit from
  // trying to create the user table we foreign-key against.
  schemaFilter: ['public', 'neon_auth'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
