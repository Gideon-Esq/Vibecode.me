'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { use, useState } from 'react';
import { MovieService, tmdb } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { useSession } from '@/hooks/use-session';
import { useLibrarySummary, useWatchedList } from '@/hooks/use-library';
import { MovieLibraryActions, useWatchedRating } from '@/components/ui/library-actions';
import { WatchedBadge } from '@/components/ui/watched-badge';

export default function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const movieId = parseInt(id);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { isAuthenticated } = useSession();
  const { isWatched } = useLibrarySummary();
  const { rate, isPending: isRating } = useWatchedRating(movieId);

  // The stored personal rating doubles as the star value, so the rating the user
  // sees always matches what is in their watched entry.
  const { data: watchedData } = useWatchedList();
  const watchedEntry = watchedData?.entries.find(
    (entry) => entry.movie.id === movieId && entry.movie.mediaType === 'movie'
  );
  const userRating = watchedEntry?.rating ?? 0;
  const watched = isWatched(movieId);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => MovieService.getDetails(movieId),
  });

  const { data: credits } = useQuery({
    queryKey: ['credits', movieId],
    queryFn: () => MovieService.getCredits(movieId),
  });

  const { data: similar } = useQuery({
    queryKey: ['similar', movieId],
    queryFn: () => MovieService.getSimilar(movieId),
  });

  // Rating a movie implies you watched it, so this records both in one step —
  // and mirrors the score to TMDB when an account is linked.
  const handleRate = (rating: number) => rate(rating);

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-netflix-red" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src={tmdb.getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-40 px-4 md:px-8 pb-16 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            className="flex-shrink-0 w-64"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Image
              src={tmdb.getImageUrl(movie.poster_path)}
              alt={movie.title}
              width={256}
              height={384}
              className="rounded-lg netflix-shadow"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            className="flex-1 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {watched && (
              <WatchedBadge
                rewatchCount={watchedEntry?.rewatchCount ?? 1}
                className="mb-1"
              />
            )}

            <h1 className="text-4xl md:text-5xl font-bold">{movie.title}</h1>

            {movie.tagline && (
              <p className="text-xl text-gray-400 italic">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-lg font-semibold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-gray-400">({movie.vote_count} votes)</span>
              </div>
              <span className="text-gray-400">
                {new Date(movie.release_date).getFullYear()}
              </span>
              <span className="text-gray-400">{movie.runtime} min</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-netflix-gray-medium rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-gray-200 leading-relaxed">{movie.overview}</p>

            <MovieLibraryActions movieId={movieId} />

            {/* Rating */}
            {isAuthenticated && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  {userRating ? `You rated this ${userRating}/10` : 'Rate this movie:'}
                </p>
                <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isRating}
                      aria-label={`Rate ${star} out of 10`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onClick={() => handleRate(star)}
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
                  Rating a movie also marks it as watched.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Cast */}
        {credits && credits.cast.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {credits.cast.slice(0, 20).map((person) => (
                <Link
                  key={person.id}
                  href={`/person/${person.id}`}
                  className="group flex-shrink-0 w-32 text-center"
                >
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-2 bg-netflix-gray-medium ring-2 ring-transparent transition-all group-hover:ring-netflix-red">
                    {person.profile_path ? (
                      <Image
                        src={tmdb.getProfileUrl(person.profile_path)}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-sm line-clamp-1 transition-colors group-hover:text-netflix-red">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1">{person.character}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar && similar.results.length > 0 && (
          <div className="-mx-4 md:-mx-8">
            <MovieCarousel title="Similar Movies" movies={similar.results} />
          </div>
        )}
      </div>
    </div>
  );
}
