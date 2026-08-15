'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MovieService } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { CarouselSkeleton } from '@/components/ui/skeleton';
import type { Movie, PaginatedResponse } from '@/types/tmdb';

const ROWS = [
  { key: 'trending', title: 'Trending This Week', fetch: () => MovieService.getTrending() },
  { key: 'now-playing', title: 'Now Playing', fetch: () => MovieService.getNowPlaying() },
  { key: 'popular', title: 'Popular', fetch: () => MovieService.getPopular() },
  { key: 'top-rated', title: 'Top Rated', fetch: () => MovieService.getTopRated() },
  { key: 'upcoming', title: 'Upcoming', fetch: () => MovieService.getUpcoming() },
];

export default function MoviesPage() {
  return (
    <div className="page-transition min-h-screen pt-24 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 md:px-8">
        <div>
          <h1 className="text-4xl font-bold">Movies</h1>
          <p className="mt-2 text-gray-400">
            Everything in the catalogue, ready to add to your library.
          </p>
        </div>
        <Link
          href="/discover"
          className="rounded-md bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/25 transition-colors hover:bg-white/20"
        >
          Filter by genre, year, rating
        </Link>
      </div>

      <div className="mt-8 space-y-12">
        {ROWS.map((row) => (
          <MovieRow key={row.key} queryKey={row.key} title={row.title} fetch={row.fetch} />
        ))}
      </div>
    </div>
  );
}

function MovieRow({
  queryKey,
  title,
  fetch,
}: {
  queryKey: string;
  title: string;
  fetch: () => Promise<PaginatedResponse<Movie>>;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['movie-row', queryKey],
    queryFn: fetch,
  });

  if (isLoading) return <CarouselSkeleton />;
  if (!data?.results.length) return null;

  return <MovieCarousel title={title} movies={data.results} />;
}
