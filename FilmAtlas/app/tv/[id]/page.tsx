'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TVService, tmdb } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { MovieLibraryActions, useWatchedRating } from '@/components/ui/library-actions';
import { WatchedBadge } from '@/components/ui/watched-badge';
import { useLibrarySummary, useWatchedList } from '@/hooks/use-library';
import { useSession } from '@/hooks/use-session';
import { toCardShow } from '@/lib/movie-shape';

export default function TVDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tvId = parseInt(id);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { isAuthenticated } = useSession();
  const { isWatched } = useLibrarySummary();
  const { rate, isPending: isRating } = useWatchedRating(tvId, 'tv');

  const { data: watchedData } = useWatchedList();
  const watchedEntry = watchedData?.entries.find(
    (entry) => entry.movie.id === tvId && entry.movie.mediaType === 'tv'
  );
  const userRating = watchedEntry?.rating ?? 0;
  const watched = isWatched(tvId, 'tv');

  const { data: show, isLoading } = useQuery({
    queryKey: ['tv', tvId],
    queryFn: () => TVService.getDetails(tvId),
  });

  const { data: credits } = useQuery({
    queryKey: ['tv-credits', tvId],
    queryFn: () => TVService.getCredits(tvId),
  });

  const { data: similar } = useQuery({
    queryKey: ['tv-similar', tvId],
    queryFn: () => TVService.getSimilar(tvId),
  });

  if (isLoading || !show) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-netflix-red" />
      </div>
    );
  }

  const firstYear = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : null;
  const lastYear = show.last_air_date
    ? new Date(show.last_air_date).getFullYear()
    : null;
  const years = show.in_production
    ? `${firstYear ?? '?'}–present`
    : firstYear && lastYear && firstYear !== lastYear
      ? `${firstYear}–${lastYear}`
      : (firstYear ?? 'N/A');

  const runtime = show.episode_run_time?.[0];

  return (
    <div className="page-transition">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <Image
          src={tmdb.getImageUrl(show.backdrop_path, 'original')}
          alt={show.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-transparent to-transparent" />
      </div>

      <div className="relative -mt-40 space-y-8 px-4 pb-16 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <motion.div
            className="w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Image
              src={tmdb.getImageUrl(show.poster_path)}
              alt={show.name}
              width={256}
              height={384}
              className="rounded-lg netflix-shadow"
            />
          </motion.div>

          <motion.div
            className="flex-1 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300 ring-1 ring-white/20">
                TV Series
              </span>
              {watched && (
                <WatchedBadge rewatchCount={watchedEntry?.rewatchCount ?? 1} />
              )}
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">{show.name}</h1>

            {show.tagline && (
              <p className="text-xl italic text-gray-400">{show.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl text-yellow-400">★</span>
                <span className="text-lg font-semibold">
                  {show.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400">({show.vote_count} votes)</span>
              </div>
              <span className="text-gray-400">{years}</span>
              <span className="text-gray-400">
                {show.number_of_seasons} season{show.number_of_seasons === 1 ? '' : 's'}
              </span>
              <span className="text-gray-400">{show.number_of_episodes} episodes</span>
              {runtime ? <span className="text-gray-400">~{runtime} min</span> : null}
              {show.status && <span className="text-gray-400">{show.status}</span>}
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-netflix-gray-medium px-3 py-1 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="leading-relaxed text-gray-200">{show.overview}</p>

            {show.created_by?.length > 0 && (
              <p className="text-sm text-gray-400">
                Created by{' '}
                {show.created_by.map((creator, index) => (
                  <span key={creator.id}>
                    {index > 0 && ', '}
                    <Link
                      href={`/person/${creator.id}`}
                      className="text-white hover:text-netflix-red"
                    >
                      {creator.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}

            {show.networks?.length > 0 && (
              <p className="text-sm text-gray-400">
                On {show.networks.map((network) => network.name).join(', ')}
              </p>
            )}

            <MovieLibraryActions movieId={tvId} mediaType="tv" />

            {isAuthenticated && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  {userRating ? `You rated this ${userRating}/10` : 'Rate this series:'}
                </p>
                <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isRating}
                      aria-label={`Rate ${star} out of 10`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onClick={() => rate(star)}
                      className="text-2xl transition-colors disabled:opacity-60"
                    >
                      <span
                        className={
                          star <= (hoveredRating || userRating)
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Rating a series also marks it as watched.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Seasons */}
        {show.seasons?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Seasons</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {show.seasons.map((season) => (
                <div key={season.id} className="w-40 flex-shrink-0">
                  <Image
                    src={tmdb.getImageUrl(season.poster_path, 'w300')}
                    alt={season.name}
                    width={160}
                    height={240}
                    className="rounded-lg bg-netflix-gray-medium"
                  />
                  <p className="mt-2 line-clamp-1 text-sm font-semibold">{season.name}</p>
                  <p className="text-xs text-gray-400">
                    {season.episode_count} episode{season.episode_count === 1 ? '' : 's'}
                    {season.air_date && ` · ${new Date(season.air_date).getFullYear()}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {credits && credits.cast.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {credits.cast.slice(0, 20).map((person) => (
                <Link
                  key={person.id}
                  href={`/person/${person.id}`}
                  className="group w-32 flex-shrink-0 text-center"
                >
                  <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-full bg-netflix-gray-medium ring-2 ring-transparent transition-all group-hover:ring-netflix-red">
                    <Image
                      src={tmdb.getProfileUrl(person.profile_path)}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-netflix-red">
                    {person.name}
                  </p>
                  <p className="line-clamp-1 text-xs text-gray-400">{person.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {similar && similar.results.length > 0 && (
          <div className="-mx-4 md:-mx-8">
            <MovieCarousel
              title="Similar Series"
              movies={similar.results.map(toCardShow)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
