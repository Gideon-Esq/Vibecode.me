import 'server-only';

import { and, count, desc, eq, sql, sum } from 'drizzle-orm';
import { db } from '@/lib/db';
import { favorites, movies, tmdbAccounts, watched, watchlist } from '@/lib/db/schema';
import type { MediaType, MovieRow } from '@/lib/db/schema';
import { decryptSecret } from '@/lib/crypto';
import * as tmdbServer from '@/lib/tmdb-server';

/**
 * The user's library.
 *
 * Design rule for this whole module: **our database is the source of truth.**
 * When the user has a linked TMDB account we additionally mirror the change to
 * TMDB, but a mirror failure never fails the request and never rolls back the
 * local write — otherwise a TMDB outage would take the app's core feature down.
 * The mirror outcome is reported back so the UI can mention it.
 */

/** How long a cached movie row is considered fresh. */
const MOVIE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface MirrorResult {
  /** True when the change was also pushed to TMDB. */
  mirrored: boolean;
  /** Present when a TMDB account is linked but the mirror call failed. */
  mirrorError?: string;
}

type LinkedAccount = { tmdbAccountId: number; sessionId: string };

async function getLinkedAccount(userId: string): Promise<LinkedAccount | null> {
  const [row] = await db
    .select({
      tmdbAccountId: tmdbAccounts.tmdbAccountId,
      sessionId: tmdbAccounts.sessionId,
    })
    .from(tmdbAccounts)
    .where(eq(tmdbAccounts.userId, userId))
    .limit(1);

  if (!row) return null;

  try {
    return { tmdbAccountId: row.tmdbAccountId, sessionId: decryptSecret(row.sessionId) };
  } catch {
    // A rotated ENCRYPTION_KEY makes stored session ids unreadable. Treat the
    // account as unlinked rather than throwing on every library write.
    return null;
  }
}

/**
 * Runs a TMDB mirror call if an account is linked, swallowing failures.
 */
async function mirror(
  userId: string,
  call: (account: LinkedAccount) => Promise<unknown>
): Promise<MirrorResult> {
  const account = await getLinkedAccount(userId);
  if (!account) return { mirrored: false };

  try {
    await call(account);
    return { mirrored: true };
  } catch (error) {
    console.error('[library] TMDB mirror failed', error);
    return {
      mirrored: false,
      mirrorError: error instanceof Error ? error.message : 'Unknown TMDB error',
    };
  }
}

/** Matches one cached title. TMDB ids repeat across types, so both are needed. */
const mediaMatches = (id: number, type: MediaType) =>
  and(eq(movies.id, id), eq(movies.mediaType, type));

/**
 * Makes sure `movies` has a fresh row for this title, because every list table
 * foreign-keys to it. Called before any insert into a list.
 */
export async function ensureMediaCached(
  mediaId: number,
  type: MediaType
): Promise<MovieRow> {
  const [existing] = await db
    .select()
    .from(movies)
    .where(mediaMatches(mediaId, type))
    .limit(1);

  const isFresh =
    existing && Date.now() - existing.syncedAt.getTime() < MOVIE_CACHE_TTL_MS;
  if (isFresh) return existing;

  let values;
  try {
    values =
      type === 'tv'
        ? await fetchShowValues(mediaId)
        : await fetchMovieValues(mediaId);
  } catch (error) {
    // If TMDB is unreachable but we already have a stale row, stale beats broken.
    if (existing) return existing;
    throw error;
  }

  const [row] = await db
    .insert(movies)
    .values(values)
    .onConflictDoUpdate({
      target: [movies.id, movies.mediaType],
      set: values,
    })
    .returning();

  return row;
}

async function fetchMovieValues(movieId: number) {
  const details = await tmdbServer.getMovieDetails(movieId);

  return {
    id: details.id,
    mediaType: 'movie' as const,
    title: details.title,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    overview: details.overview,
    // TMDB sends "" for unknown dates, which is not a valid date literal.
    releaseDate: details.release_date || null,
    runtime: details.runtime ?? null,
    voteAverage: details.vote_average ?? null,
    genres: details.genres ?? [],
    syncedAt: new Date(),
  };
}

async function fetchShowValues(tvId: number) {
  const details = await tmdbServer.getTVDetails(tvId);

  // Marking a series watched means finishing it, so the stored runtime is the
  // whole run — otherwise "time watched" would count a single episode per show.
  const episodeRuntime = details.episode_run_time?.[0] ?? null;
  const totalRuntime =
    episodeRuntime && details.number_of_episodes
      ? episodeRuntime * details.number_of_episodes
      : episodeRuntime;

  return {
    id: details.id,
    mediaType: 'tv' as const,
    title: details.name,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    overview: details.overview,
    releaseDate: details.first_air_date || null,
    runtime: totalRuntime,
    voteAverage: details.vote_average ?? null,
    genres: details.genres ?? [],
    syncedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Summary — one round-trip that powers every "is this in my library?" badge
// ---------------------------------------------------------------------------

/**
 * Entries are `"movie-550"` / `"tv-1399"` keys rather than bare ids, because an
 * id alone is ambiguous across media types.
 */
export interface LibrarySummary {
  watchlist: string[];
  favorites: string[];
  watched: string[];
}

export function mediaKey(id: number, type: MediaType): string {
  return `${type}-${id}`;
}

export async function getLibrarySummary(userId: string): Promise<LibrarySummary> {
  const columns = (table: typeof watchlist | typeof favorites | typeof watched) => ({
    movieId: table.movieId,
    mediaType: table.mediaType,
  });

  const [watchlistRows, favoriteRows, watchedRows] = await Promise.all([
    db.select(columns(watchlist)).from(watchlist).where(eq(watchlist.userId, userId)),
    db.select(columns(favorites)).from(favorites).where(eq(favorites.userId, userId)),
    db.select(columns(watched)).from(watched).where(eq(watched.userId, userId)),
  ]);

  const toKeys = (rows: { movieId: number; mediaType: MediaType }[]) =>
    rows.map((row) => mediaKey(row.movieId, row.mediaType));

  return {
    watchlist: toKeys(watchlistRows),
    favorites: toKeys(favoriteRows),
    watched: toKeys(watchedRows),
  };
}

// ---------------------------------------------------------------------------
// Watchlist
// ---------------------------------------------------------------------------

export async function getWatchlist(userId: string): Promise<MovieRow[]> {
  const rows = await db
    .select({ movie: movies })
    .from(watchlist)
    .innerJoin(
      movies,
      and(eq(movies.id, watchlist.movieId), eq(movies.mediaType, watchlist.mediaType))
    )
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.addedAt));

  return rows.map((row) => row.movie);
}

export async function setWatchlist(
  userId: string,
  mediaId: number,
  type: MediaType,
  isOn: boolean
): Promise<MirrorResult> {
  if (isOn) {
    await ensureMediaCached(mediaId, type);
    await db
      .insert(watchlist)
      .values({ userId, movieId: mediaId, mediaType: type })
      .onConflictDoNothing();
  } else {
    await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, mediaId),
          eq(watchlist.mediaType, type)
        )
      );
  }

  return mirror(userId, (account) =>
    tmdbServer.setWatchlist(
      account.tmdbAccountId,
      account.sessionId,
      mediaId,
      type,
      isOn
    )
  );
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export async function getFavorites(userId: string): Promise<MovieRow[]> {
  const rows = await db
    .select({ movie: movies })
    .from(favorites)
    .innerJoin(
      movies,
      and(eq(movies.id, favorites.movieId), eq(movies.mediaType, favorites.mediaType))
    )
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.addedAt));

  return rows.map((row) => row.movie);
}

export async function setFavorite(
  userId: string,
  mediaId: number,
  type: MediaType,
  isOn: boolean
): Promise<MirrorResult> {
  if (isOn) {
    await ensureMediaCached(mediaId, type);
    await db
      .insert(favorites)
      .values({ userId, movieId: mediaId, mediaType: type })
      .onConflictDoNothing();
  } else {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.movieId, mediaId),
          eq(favorites.mediaType, type)
        )
      );
  }

  return mirror(userId, (account) =>
    tmdbServer.setFavorite(
      account.tmdbAccountId,
      account.sessionId,
      mediaId,
      type,
      isOn
    )
  );
}

// ---------------------------------------------------------------------------
// Watched
// ---------------------------------------------------------------------------

export interface WatchedEntry {
  movie: MovieRow;
  watchedAt: Date;
  rating: number | null;
  rewatchCount: number;
  notes: string | null;
}

export async function getWatched(userId: string): Promise<WatchedEntry[]> {
  const rows = await db
    .select({
      movie: movies,
      watchedAt: watched.watchedAt,
      rating: watched.rating,
      rewatchCount: watched.rewatchCount,
      notes: watched.notes,
    })
    .from(watched)
    .innerJoin(
      movies,
      and(eq(movies.id, watched.movieId), eq(movies.mediaType, watched.mediaType))
    )
    .where(eq(watched.userId, userId))
    .orderBy(desc(watched.watchedAt));

  return rows;
}

export interface WatchedInput {
  watchedAt?: Date;
  rating?: number | null;
  notes?: string | null;
  /** Bumps `rewatch_count` instead of overwriting it. */
  incrementRewatch?: boolean;
}

/**
 * Marks a movie watched, or updates an existing entry.
 *
 * TMDB has no watched list, so the mirror here is the closest equivalent: if the
 * entry carries a personal rating and an account is linked, that rating is sent
 * to TMDB. Marking watched without a rating touches TMDB not at all.
 */
export async function setWatched(
  userId: string,
  mediaId: number,
  type: MediaType,
  input: WatchedInput = {}
): Promise<MirrorResult> {
  await ensureMediaCached(mediaId, type);

  const now = new Date();
  await db
    .insert(watched)
    .values({
      userId,
      movieId: mediaId,
      mediaType: type,
      watchedAt: input.watchedAt ?? now,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [watched.userId, watched.movieId, watched.mediaType],
      set: {
        ...(input.watchedAt ? { watchedAt: input.watchedAt } : {}),
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.incrementRewatch
          ? { rewatchCount: sql`${watched.rewatchCount} + 1` }
          : {}),
        updatedAt: now,
      },
    });

  if (input.rating === undefined || input.rating === null) {
    return { mirrored: false };
  }

  const rating = input.rating;
  return mirror(userId, (account) =>
    tmdbServer.rateMedia(account.sessionId, mediaId, type, rating)
  );
}

export async function removeWatched(
  userId: string,
  mediaId: number,
  type: MediaType
): Promise<MirrorResult> {
  const [removed] = await db
    .delete(watched)
    .where(
      and(
        eq(watched.userId, userId),
        eq(watched.movieId, mediaId),
        eq(watched.mediaType, type)
      )
    )
    .returning({ rating: watched.rating });

  // Only withdraw the TMDB rating if we had pushed one.
  if (!removed?.rating) return { mirrored: false };

  return mirror(userId, (account) =>
    tmdbServer.deleteRating(account.sessionId, mediaId, type)
  );
}

export interface WatchedStats {
  totalWatched: number;
  totalMinutes: number;
  totalRewatches: number;
  averageRating: number | null;
  watchedThisYear: number;
}

export async function getWatchedStats(userId: string): Promise<WatchedStats> {
  const startOfYear = new Date(new Date().getUTCFullYear(), 0, 1);

  const [[totals], [thisYear]] = await Promise.all([
    db
      .select({
        totalWatched: count(),
        totalMinutes: sum(movies.runtime).mapWith(Number),
        totalRewatches: sum(watched.rewatchCount).mapWith(Number),
        averageRating: sql<number | null>`avg(${watched.rating})`.mapWith(Number),
      })
      .from(watched)
      .innerJoin(
        movies,
        and(eq(movies.id, watched.movieId), eq(movies.mediaType, watched.mediaType))
      )
      .where(eq(watched.userId, userId)),
    db
      .select({ value: count() })
      .from(watched)
      .where(
        and(eq(watched.userId, userId), sql`${watched.watchedAt} >= ${startOfYear}`)
      ),
  ]);

  return {
    totalWatched: totals?.totalWatched ?? 0,
    totalMinutes: totals?.totalMinutes ?? 0,
    // rewatchCount counts the first viewing too, so extra viewings is count - total.
    totalRewatches: Math.max(0, (totals?.totalRewatches ?? 0) - (totals?.totalWatched ?? 0)),
    averageRating: Number.isFinite(totals?.averageRating) ? totals!.averageRating : null,
    watchedThisYear: thisYear?.value ?? 0,
  };
}
