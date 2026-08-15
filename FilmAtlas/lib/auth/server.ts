import 'server-only';

import { createNeonAuth, type NeonAuth } from '@neondatabase/auth/next/server';

let instance: NeonAuth | null = null;

function connect(): NeonAuth {
  if (instance) return instance;

  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl || !secret) {
    throw new Error(
      'NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set. Copy them from the Auth page of your Neon project into .env.local.'
    );
  }

  instance = createNeonAuth({ baseUrl, cookies: { secret } });
  return instance;
}

/**
 * Neon Auth (Managed Better Auth) server instance, created on first use.
 *
 * `createNeonAuth` validates its config eagerly, so building it at import time
 * would break `next build` on any machine without the secrets — the build imports
 * every route module to collect page data.
 *
 * Everything else in the app reaches auth through `lib/auth/session.ts` rather
 * than importing this directly, so swapping the auth provider is a one-file change.
 */
export const auth = new Proxy({} as NeonAuth, {
  get: (_target, property, receiver) =>
    Reflect.get(connect() as object, property, receiver),
});
