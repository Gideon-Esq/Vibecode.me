'use client';

import { useQuery } from '@tanstack/react-query';
import { TVService } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { CarouselSkeleton } from '@/components/ui/skeleton';
import { toCardShow } from '@/lib/movie-shape';
import type { PaginatedResponse, TVShow } from '@/types/tmdb';

const ROWS = [
  { key: 'trending', title: 'Trending This Week', fetch: () => TVService.getTrending() },
  { key: 'popular', title: 'Popular Series', fetch: () => TVService.getPopular() },
  { key: 'top-rated', title: 'Top Rated', fetch: () => TVService.getTopRated() },
  { key: 'on-the-air', title: 'On The Air', fetch: () => TVService.getOnTheAir() },
  { key: 'airing-today', title: 'Airing Today', fetch: () => TVService.getAiringToday() },
];

export default function TVPage() {
  return (
    <div className="page-transition min-h-screen pt-24 pb-16">
      <div className="px-4 md:px-8">
        <h1 className="text-4xl font-bold">TV Series</h1>
        <p className="mt-2 text-gray-400">
          Browse what&apos;s airing and what people are watching.
        </p>
      </div>

      <div className="mt-8 space-y-12">
        {ROWS.map((row) => (
          <TVRow key={row.key} queryKey={row.key} title={row.title} fetch={row.fetch} />
        ))}
      </div>
    </div>
  );
}

function TVRow({
  queryKey,
  title,
  fetch,
}: {
  queryKey: string;
  title: string;
  fetch: () => Promise<PaginatedResponse<TVShow>>;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['tv-row', queryKey],
    queryFn: fetch,
  });

  if (isLoading) return <CarouselSkeleton />;
  if (!data?.results.length) return null;

  return <MovieCarousel title={title} movies={data.results.map(toCardShow)} />;
}
