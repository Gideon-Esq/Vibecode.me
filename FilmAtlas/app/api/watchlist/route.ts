import { getWatchlist, setWatchlist } from '@/lib/library';
import { parseMediaType, parseMovieId, readJson, withUser } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = withUser(async (userId) => ({
  movies: await getWatchlist(userId),
}));

export const POST = withUser(async (userId, request) => {
  const body = await readJson(request);
  return setWatchlist(userId, parseMovieId(body), parseMediaType(body), true);
});

export const DELETE = withUser(async (userId, request) => {
  const body = await readJson(request);
  return setWatchlist(userId, parseMovieId(body), parseMediaType(body), false);
});
