'use client';

import { useQuery } from '@tanstack/react-query';
import { HeroSection } from '@/components/ui/hero-section';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { HeroSkeleton, CarouselSkeleton } from '@/components/ui/skeleton';
import { MovieService } from '@/lib/tmdb';

export default function HomePage() {
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => MovieService.getTrending(),
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ['now-playing'],
    queryFn: () => MovieService.getNowPlaying(),
  });

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: () => MovieService.getPopular(),
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ['top-rated'],
    queryFn: () => MovieService.getTopRated(),
  });

  const heroMovie = trending?.results[0];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      {trendingLoading || !heroMovie ? (
        <HeroSkeleton />
      ) : (
        <HeroSection movie={heroMovie} />
      )}

      {/* Movie Carousels */}
      <div className="space-y-12 pb-16 -mt-32 relative z-10">
        {trendingLoading ? (
          <CarouselSkeleton />
        ) : trending?.results ? (
          <MovieCarousel title="Trending Now" movies={trending.results} />
        ) : null}

        {nowPlayingLoading ? (
          <CarouselSkeleton />
        ) : nowPlaying?.results ? (
          <MovieCarousel title="Now Playing" movies={nowPlaying.results} />
        ) : null}

        {popularLoading ? (
          <CarouselSkeleton />
        ) : popular?.results ? (
          <MovieCarousel title="Popular" movies={popular.results} />
        ) : null}

        {topRatedLoading ? (
          <CarouselSkeleton />
        ) : topRated?.results ? (
          <MovieCarousel title="Top Rated" movies={topRated.results} />
        ) : null}
      </div>
    </div>
  );
}
