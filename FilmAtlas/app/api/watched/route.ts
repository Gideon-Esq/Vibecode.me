import { getWatched, getWatchedStats, removeWatched, setWatched } from '@/lib/library';
import {
  BadRequestError,
  parseMediaType,
  parseMovieId,
  parseRating,
  readJson,
  withUser,
} from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = withUser(async (userId) => {
  const [entries, stats] = await Promise.all([
    getWatched(userId),
    getWatchedStats(userId),
  ]);
  return { entries, stats };
});

/** Marks a movie watched, or updates an existing entry (rating, notes, date, rewatch). */
export const POST = withUser(async (userId, request) => {
  const body = await readJson(request);
  const movieId = parseMovieId(body);

  let watchedAt: Date | undefined;
  if (typeof body.watchedAt === 'string') {
    watchedAt = new Date(body.watchedAt);
    if (Number.isNaN(watchedAt.getTime())) {
      throw new BadRequestError('watchedAt must be an ISO date string');
    }
  }

  return setWatched(userId, movieId, parseMediaType(body), {
    watchedAt,
    rating: parseRating(body),
    notes: typeof body.notes === 'string' ? body.notes : undefined,
    incrementRewatch: body.incrementRewatch === true,
  });
});

export const DELETE = withUser(async (userId, request) => {
  const body = await readJson(request);
  return removeWatched(userId, parseMovieId(body), parseMediaType(body));
});
