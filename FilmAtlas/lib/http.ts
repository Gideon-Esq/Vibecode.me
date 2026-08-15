import 'server-only';

import { NextResponse } from 'next/server';
import { UnauthorizedError, requireUserId } from '@/lib/auth/session';

export class BadRequestError extends Error {}

/**
 * Wraps a route handler so it receives the signed-in user's id, and so thrown
 * errors become sensible JSON responses instead of opaque 500s.
 */
export function withUser<T>(
  handler: (userId: string, request: Request) => Promise<T>
): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    try {
      const userId = await requireUserId();
      return NextResponse.json(await handler(userId, request));
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  if (error instanceof BadRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.error('[api]', error);
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== 'object') throw new Error();
    return raw as Record<string, unknown>;
  } catch {
    throw new BadRequestError('Expected a JSON object body');
  }
}

/** Defaults to 'movie' so older clients and movie-only callers keep working. */
export function parseMediaType(body: Record<string, unknown>): 'movie' | 'tv' {
  const raw = body.mediaType;
  if (raw === undefined || raw === null) return 'movie';

  if (raw !== 'movie' && raw !== 'tv') {
    throw new BadRequestError("mediaType must be 'movie' or 'tv'");
  }
  return raw;
}

export function parseMovieId(body: Record<string, unknown>): number {
  const raw = body.movieId;
  const movieId = typeof raw === 'string' ? Number(raw) : raw;

  if (typeof movieId !== 'number' || !Number.isInteger(movieId) || movieId <= 0) {
    throw new BadRequestError('movieId must be a positive integer');
  }
  return movieId;
}

/** Optional 1–10 personal score. Returns `undefined` when absent, `null` when explicitly cleared. */
export function parseRating(body: Record<string, unknown>): number | null | undefined {
  if (!('rating' in body)) return undefined;
  if (body.rating === null) return null;

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw new BadRequestError('rating must be an integer between 1 and 10');
  }
  return rating;
}
