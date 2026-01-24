'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchService } from '@/lib/tmdb';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieCardSkeleton } from '@/components/ui/skeleton';

export default function DiscoverPage() {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [releaseYear, setReleaseYear] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => SearchService.getGenres(),
  });

  const { data: movies, isLoading } = useQuery({
    queryKey: ['discover', selectedGenre, releaseYear, minRating],
    queryFn: () =>
      SearchService.discover({
        with_genres: selectedGenre || undefined,
        primary_release_year: releaseYear,
        'vote_average.gte': minRating,
        sort_by: 'popularity.desc',
      }),
  });

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <h1 className="text-4xl font-bold mb-8">Discover Movies</h1>

      {/* Filters */}
      <div className="glassmorphism p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 bg-netflix-gray-dark rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              <option value="">All Genres</option>
              {genres?.genres.map((genre) => (
                <option key={genre.id} value={genre.id.toString()}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Release Year</label>
            <input
              type="number"
              value={releaseYear || ''}
              onChange={(e) => setReleaseYear(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 2024"
              className="w-full px-4 py-2 bg-netflix-gray-dark rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Minimum Rating</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={minRating || ''}
              onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 7.0"
              className="w-full px-4 py-2 bg-netflix-gray-dark rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading
          ? [...Array(20)].map((_, i) => <MovieCardSkeleton key={i} />)
          : movies?.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
      </div>

      {!isLoading && movies?.results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">No movies found with these filters.</p>
        </div>
      )}
    </div>
  );
}
