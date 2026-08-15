'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { tmdb } from '@/lib/tmdb';
import { useLibrarySummary } from '@/hooks/use-library';
import { MovieQuickActions } from './library-actions';
import { WatchedBadge } from './watched-badge';
import { mediaHref, type CardMovie } from '@/lib/movie-shape';

interface MovieCardProps {
  /** A TMDB movie or TV show, or a database row passed through `toCardMovie`. */
  movie: CardMovie;
  onHover?: (movie: CardMovie | null) => void;
  /** Extra content rendered under the title — used by the watched page. */
  footer?: React.ReactNode;
}

export function MovieCard({ movie, onHover, footer }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isWatched } = useLibrarySummary();

  const mediaType = movie.media_type ?? 'movie';
  const watched = isWatched(movie.id, mediaType);

  return (
    <Link href={mediaHref(movie)}>
      <motion.div
        className="flex-shrink-0 w-[200px] md:w-[250px] cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => {
          setIsHovered(true);
          onHover?.(movie);
        }}
        onHoverEnd={() => {
          setIsHovered(false);
          onHover?.(null);
        }}
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden netflix-shadow">
          <Image
            src={tmdb.getImageUrl(movie.poster_path)}
            alt={movie.title}
            fill
            // Watched posters are dimmed so an unwatched title stands out in a grid.
            className={`object-cover transition-all duration-300 ${
              watched ? 'brightness-[0.55] saturate-[0.75] group-hover:brightness-90' : ''
            }`}
            sizes="(max-width: 768px) 200px, 250px"
          />

          {watched && (
            <div className="absolute top-2 left-2 z-10">
              <WatchedBadge compact />
            </div>
          )}

          {/* Hover overlay. pointer-events are disabled while it is transparent so
              the action buttons can't be clicked invisibly. */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
              <h3 className="font-bold text-sm md:text-base line-clamp-2">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>{movie.vote_average?.toFixed(1) ?? '—'}</span>
                </div>
                <span className="text-gray-400">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </span>
              </div>
              <MovieQuickActions movieId={movie.id} mediaType={mediaType} />
            </div>
          </motion.div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold text-sm line-clamp-1">{movie.title}</h3>
          {footer}
        </div>
      </motion.div>
    </Link>
  );
}
