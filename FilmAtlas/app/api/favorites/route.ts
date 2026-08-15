import { getFavorites, setFavorite } from '@/lib/library';
import { parseMediaType, parseMovieId, readJson, withUser } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = withUser(async (userId) => ({
  movies: await getFavorites(userId),
}));

export const POST = withUser(async (userId, request) => {
  const body = await readJson(request);
  return setFavorite(userId, parseMovieId(body), parseMediaType(body), true);
});

export const DELETE = withUser(async (userId, request) => {
  const body = await readJson(request);
  return setFavorite(userId, parseMovieId(body), parseMediaType(body), false);
});
