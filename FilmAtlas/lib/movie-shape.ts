import type { MovieRow } from '@/lib/db/schema';
import type { TVShow } from '@/types/tmdb';

/**
 * The single shape every card renders.
 *
 * It exists because three sources disagree: TMDB movies use
 * `title`/`release_date`, TMDB TV uses `name`/`first_air_date`, and our own
 * `movies` table uses camelCase columns. Normalising here keeps the card simple.
 */
export interface CardMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  /** Drives the link target. Defaults to 'movie' when absent. */
  media_type?: 'movie' | 'tv';
}

export function toCardMovie(row: MovieRow): CardMovie {
  return {
    id: row.id,
    title: row.title,
    poster_path: row.posterPath,
    vote_average: row.voteAverage ?? 0,
    release_date: row.releaseDate ?? '',
    media_type: row.mediaType,
  };
}

export function toCardShow(show: TVShow): CardMovie {
  return {
    id: show.id,
    title: show.name,
    poster_path: show.poster_path,
    vote_average: show.vote_average ?? 0,
    release_date: show.first_air_date ?? '',
    media_type: 'tv',
  };
}

export function mediaHref(media: CardMovie): string {
  return media.media_type === 'tv' ? `/tv/${media.id}` : `/movie/${media.id}`;
}

/** Formats a minute count as "1d 4h" / "18h 30m" / "94m". */
export function formatRuntime(totalMinutes: number): string {
  if (!totalMinutes) return '0m';

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
