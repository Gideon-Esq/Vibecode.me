'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { AccountService } from '@/lib/tmdb';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieCardSkeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { isAuthenticated, account } = useAuthStore();
  const router = useRouter();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', account?.id],
    queryFn: () => AccountService.getFavorites(account!.id),
    enabled: isAuthenticated && !!account,
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <h1 className="text-4xl font-bold mb-8">My Favorites</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites?.results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400 mb-4">You haven't favorited any movies yet.</p>
          <button
            onClick={() => router.push('/discover')}
            className="px-6 py-3 bg-netflix-red hover:bg-netflix-red/90 rounded-md font-semibold"
          >
            Discover Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites?.results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
