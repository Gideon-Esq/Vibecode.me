import 'server-only';

import type {
  AccountDetails,
  ApiResponse,
  AuthToken,
  MovieDetails,
  Session,
  TVDetails,
} from '@/types/tmdb';

/**
 * Server-side TMDB client.
 *
 * The browser client in `lib/tmdb.ts` handles public reads. This module handles
 * everything that needs a TMDB *session id*, which never leaves the server: it is
 * stored encrypted in `tmdb_accounts` and decrypted only inside route handlers.
 */

const BASE_URL =
  process.env.TMDB_API_BASE_URL ||
  process.env.NEXT_PUBLIC_TMDB_API_BASE_URL ||
  'https://api.themoviedb.org/3';

const AUTH_BASE_URL =
  process.env.TMDB_AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_TMDB_AUTH_BASE_URL ||
  'https://www.themoviedb.org';

function apiKey(): string {
  const key = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY is not set');
  return key;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  /** Seconds to cache the response for. Omit for uncached (all session-scoped calls). */
  revalidate?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params = {}, body, revalidate } = options;

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey());
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate } }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new TmdbError(
      `TMDB ${method} ${path} failed with ${response.status}`,
      response.status,
      detail
    );
  }

  return (await response.json()) as T;
}

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail: string
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Cached for a day — title metadata is effectively static. */
export function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return request<MovieDetails>(`/movie/${movieId}`, { revalidate: 86_400 });
}

export function getTVDetails(tvId: number): Promise<TVDetails> {
  return request<TVDetails>(`/tv/${tvId}`, { revalidate: 86_400 });
}

// ---------------------------------------------------------------------------
// Authentication (TMDB's 3-legged flow)
// ---------------------------------------------------------------------------

export function createRequestToken(): Promise<AuthToken> {
  return request<AuthToken>('/authentication/token/new');
}

export function buildApproveUrl(requestToken: string, redirectTo: string): string {
  return `${AUTH_BASE_URL}/authenticate/${requestToken}?redirect_to=${encodeURIComponent(redirectTo)}`;
}

export function createSession(requestToken: string): Promise<Session> {
  return request<Session>('/authentication/session/new', {
    method: 'POST',
    body: { request_token: requestToken },
  });
}

export function deleteSession(sessionId: string): Promise<ApiResponse> {
  return request<ApiResponse>('/authentication/session', {
    method: 'DELETE',
    body: { session_id: sessionId },
  });
}

export function getAccountDetails(sessionId: string): Promise<AccountDetails> {
  return request<AccountDetails>('/account', { params: { session_id: sessionId } });
}

// ---------------------------------------------------------------------------
// Writes — these are the calls mirrored from our database to TMDB
// ---------------------------------------------------------------------------

export type MediaType = 'movie' | 'tv';

export function setWatchlist(
  accountId: number,
  sessionId: string,
  mediaId: number,
  mediaType: MediaType,
  watchlist: boolean
): Promise<ApiResponse> {
  return request<ApiResponse>(`/account/${accountId}/watchlist`, {
    method: 'POST',
    params: { session_id: sessionId },
    body: { media_type: mediaType, media_id: mediaId, watchlist },
  });
}

export function setFavorite(
  accountId: number,
  sessionId: string,
  mediaId: number,
  mediaType: MediaType,
  favorite: boolean
): Promise<ApiResponse> {
  return request<ApiResponse>(`/account/${accountId}/favorite`, {
    method: 'POST',
    params: { session_id: sessionId },
    body: { media_type: mediaType, media_id: mediaId, favorite },
  });
}

export function rateMedia(
  sessionId: string,
  mediaId: number,
  mediaType: MediaType,
  value: number
): Promise<ApiResponse> {
  return request<ApiResponse>(`/${mediaType}/${mediaId}/rating`, {
    method: 'POST',
    params: { session_id: sessionId },
    body: { value },
  });
}

export function deleteRating(
  sessionId: string,
  mediaId: number,
  mediaType: MediaType
): Promise<ApiResponse> {
  return request<ApiResponse>(`/${mediaType}/${mediaId}/rating`, {
    method: 'DELETE',
    params: { session_id: sessionId },
  });
}
