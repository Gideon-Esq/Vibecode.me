'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useFavorites } from '@/hooks/use-library';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieCardSkeleton } from '@/components/ui/skeleton';
import { toCardMovie } from '@/lib/movie-shape';

export default function FavoritesPage() {
  const { isReady } = useRequireAuth();
  const { data, isLoading } = useFavorites();

  if (!isReady) return null;

  const movies = data?.movies ?? [];

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
      <p className="text-gray-400 mb-8">
        Saved to your Cineast account, and mirrored to TMDB when connected.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400 mb-4">No favorites yet.</p>
          <Link
            href="/discover"
            className="inline-block px-6 py-3 bg-netflix-red hover:bg-netflix-red/90 rounded-md font-semibold"
          >
            Discover Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={toCardMovie(movie)} />
          ))}
        </div>
      )}
    </div>
  );
}
