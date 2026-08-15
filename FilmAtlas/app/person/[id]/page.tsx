'use client';

import Image from 'next/image';
import { use, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PersonService, tmdb } from '@/lib/tmdb';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieCardSkeleton } from '@/components/ui/skeleton';
import type { Movie } from '@/types/tmdb';

export default function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const personId = parseInt(id);

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => PersonService.getDetails(personId),
  });

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['person-credits', personId],
    queryFn: () => PersonService.getMovieCredits(personId),
  });

  // Someone can appear in the same film more than once (e.g. actor and producer),
  // so dedupe by id and lead with the best-known titles.
  const movies = useMemo(() => {
    if (!credits) return [];

    const byId = new Map<number, Movie>();
    for (const movie of [...credits.cast, ...credits.crew]) {
      if (!byId.has(movie.id)) byId.set(movie.id, movie);
    }

    return [...byId.values()].sort(
      (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
    );
  }, [credits]);

  if (isLoading || !person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-netflix-red" />
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen px-4 pt-24 pb-16 md:px-8">
      <motion.div
        className="flex flex-col gap-8 md:flex-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-48 flex-shrink-0 md:w-64">
          <Image
            src={tmdb.getProfileUrl(person.profile_path, 'h632')}
            alt={person.name}
            width={256}
            height={384}
            className="w-full rounded-lg netflix-shadow"
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl">{person.name}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            {person.known_for_department && (
              <span>Known for {person.known_for_department}</span>
            )}
            {person.birthday && (
              <span>
                Born {new Date(person.birthday).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>

          {person.biography ? (
            <p className="max-w-3xl leading-relaxed whitespace-pre-line text-gray-200">
              {person.biography}
            </p>
          ) : (
            <p className="text-gray-500">No biography available.</p>
          )}
        </div>
      </motion.div>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold">
          Movies{movies.length > 0 && ` (${movies.length})`}
        </h2>

        {creditsLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <p className="text-gray-400">No movie credits found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
