import 'server-only';

import { cookies } from 'next/headers';

/** Cookie holding the in-flight TMDB approval. */
const FLOW_COOKIE = 'tmdb_flow';
const FLOW_TTL_SECONDS = 15 * 60;

export type TmdbFlowMode = 'signin' | 'link';

export interface TmdbFlowState {
  requestToken: string;
  mode: TmdbFlowMode;
  /** Where to send the user once the flow finishes. */
  next: string;
}

/**
 * The request token is kept in an httpOnly cookie rather than only in the URL,
 * and the callback requires the two to match.
 *
 * That match is the CSRF defence: without it, an attacker could get their own
 * TMDB token approved and then lure a signed-in victim to the callback URL,
 * silently attaching the attacker's TMDB account to the victim's app account.
 */
export async function beginFlow(state: TmdbFlowState): Promise<void> {
  const store = await cookies();
  store.set(FLOW_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: FLOW_TTL_SECONDS,
  });
}

export async function consumeFlow(): Promise<TmdbFlowState | null> {
  const store = await cookies();
  const raw = store.get(FLOW_COOKIE)?.value;
  store.delete(FLOW_COOKIE);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as TmdbFlowState;
    if (typeof parsed.requestToken !== 'string') return null;
    if (parsed.mode !== 'signin' && parsed.mode !== 'link') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Resolves the public origin of this app — the URL a browser would use.
 *
 * `request.url` is the origin the server socket saw, which behind any proxy
 * (Codespaces, ngrok, Vercel, a load balancer) is `localhost:3000` rather than the
 * address the user is actually on. Sending that to TMDB as `redirect_to` bounces
 * people to their own machine after approving. The real host is in the forwarded
 * headers, so those win.
 */
export function appOrigin(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  const requestUrl = new URL(request.url);

  // May be a comma-separated chain when several proxies are involved; the first
  // entry is the original client-facing host.
  const forwardedHost = firstValue(request.headers.get('x-forwarded-host'));
  const host = forwardedHost || request.headers.get('host');

  if (!host) return requestUrl.origin;

  // A local host keeps whatever scheme the request came in on (http in dev).
  // Any other host is reached through a proxy that terminates TLS, so the
  // inbound scheme is http even though the browser is on https — and
  // `x-forwarded-proto` is unreliable here because Next's dev server sets it
  // from the local connection. Set NEXT_PUBLIC_APP_URL to override.
  const protocol = isLocalHost(host) ? requestUrl.protocol.replace(':', '') : 'https';

  return `${protocol}://${host}`;
}

function firstValue(header: string | null): string | null {
  const value = header?.split(',')[0]?.trim();
  return value || null;
}

function isLocalHost(host: string): boolean {
  const hostname = host.split(':')[0];
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

export { safeNext as safeNextPath } from '@/lib/next-path';
