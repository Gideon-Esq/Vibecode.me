'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  type MediaType,
  useFavoriteToggle,
  useLibrarySummary,
  useWatchedMutation,
  useWatchlistToggle,
} from '@/hooks/use-library';
import { useSession } from '@/hooks/use-session';
import { CheckIcon, EyeIcon, HeartIcon, PlusIcon, SpinnerIcon } from './icons';

/**
 * Shared behaviour for every library control: resolve current state, require a
 * session, and surface the TMDB mirror result if it failed.
 */
function useLibraryControls(movieId: number, mediaType: MediaType = 'movie') {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const { isInWatchlist, isFavorite, isWatched } = useLibrarySummary();
  const watchlistToggle = useWatchlistToggle();
  const favoriteToggle = useFavoriteToggle();
  const { markWatched, unmarkWatched } = useWatchedMutation();
  const [mirrorWarning, setMirrorWarning] = useState<string | null>(null);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    router.push('/login');
    return false;
  };

  const report = (result: { mirrorError?: string }) => {
    setMirrorWarning(
      result.mirrorError ? 'Saved here, but TMDB could not be updated.' : null
    );
  };

  return {
    isAuthenticated,
    mirrorWarning,
    inWatchlist: isInWatchlist(movieId, mediaType),
    favorite: isFavorite(movieId, mediaType),
    watched: isWatched(movieId, mediaType),
    pending: {
      watchlist: watchlistToggle.isPending,
      favorite: favoriteToggle.isPending,
      watched: markWatched.isPending || unmarkWatched.isPending,
    },
    toggleWatchlist: () => {
      if (!requireAuth()) return;
      watchlistToggle.mutate(
        { movieId, mediaType, isOn: !isInWatchlist(movieId, mediaType) },
        { onSuccess: report }
      );
    },
    toggleFavorite: () => {
      if (!requireAuth()) return;
      favoriteToggle.mutate(
        { movieId, mediaType, isOn: !isFavorite(movieId, mediaType) },
        { onSuccess: report }
      );
    },
    toggleWatched: (rating?: number | null) => {
      if (!requireAuth()) return;
      if (isWatched(movieId, mediaType) && rating === undefined) {
        unmarkWatched.mutate({ movieId, mediaType }, { onSuccess: report });
      } else {
        markWatched.mutate({ movieId, mediaType, rating }, { onSuccess: report });
      }
    },
    markRewatch: () => {
      if (!requireAuth()) return;
      markWatched.mutate(
        { movieId, mediaType, incrementRewatch: true },
        { onSuccess: report }
      );
    },
  };
}

/**
 * Compact icon row shown on card hover. Lives inside a <Link>, so each button
 * stops the click from navigating.
 */
export function MovieQuickActions({
  movieId,
  mediaType = 'movie',
}: {
  movieId: number;
  mediaType?: MediaType;
}) {
  const controls = useLibraryControls(movieId, mediaType);

  const intercept = (action: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  const buttonClass = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
      active
        ? 'bg-white text-black'
        : 'bg-black/60 text-white ring-1 ring-white/30 hover:bg-black/80'
    }`;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={intercept(controls.toggleWatched)}
        disabled={controls.pending.watched}
        aria-pressed={controls.watched}
        aria-label={controls.watched ? 'Remove from watched' : 'Mark as watched'}
        title={controls.watched ? 'Remove from watched' : 'Mark as watched'}
        className={buttonClass(controls.watched)}
      >
        {controls.pending.watched ? <SpinnerIcon /> : <CheckIcon />}
      </button>

      <button
        type="button"
        onClick={intercept(controls.toggleWatchlist)}
        disabled={controls.pending.watchlist}
        aria-pressed={controls.inWatchlist}
        aria-label={controls.inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        title={controls.inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        className={buttonClass(controls.inWatchlist)}
      >
        {controls.pending.watchlist ? (
          <SpinnerIcon />
        ) : controls.inWatchlist ? (
          <CheckIcon />
        ) : (
          <PlusIcon />
        )}
      </button>

      <button
        type="button"
        onClick={intercept(controls.toggleFavorite)}
        disabled={controls.pending.favorite}
        aria-pressed={controls.favorite}
        aria-label={controls.favorite ? 'Remove from favorites' : 'Add to favorites'}
        title={controls.favorite ? 'Remove from favorites' : 'Add to favorites'}
        className={buttonClass(false)}
      >
        {controls.pending.favorite ? (
          <SpinnerIcon />
        ) : (
          <HeartIcon
            filled={controls.favorite}
            className={`w-4 h-4 ${controls.favorite ? 'text-netflix-red' : ''}`}
          />
        )}
      </button>
    </div>
  );
}

/**
 * Full-size controls for the movie detail page.
 */
export function MovieLibraryActions({
  movieId,
  mediaType = 'movie',
}: {
  movieId: number;
  mediaType?: MediaType;
}) {
  const controls = useLibraryControls(movieId, mediaType);

  const base =
    'inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold transition-colors disabled:opacity-60';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => controls.toggleWatched()}
          disabled={controls.pending.watched}
          aria-pressed={controls.watched}
          className={`${base} ${
            controls.watched
              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
              : 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20'
          }`}
        >
          {controls.pending.watched ? <SpinnerIcon /> : <CheckIcon />}
          {controls.watched ? 'Watched' : 'Mark as watched'}
        </button>

        <button
          type="button"
          onClick={controls.toggleWatchlist}
          disabled={controls.pending.watchlist}
          aria-pressed={controls.inWatchlist}
          className={`${base} ${
            controls.inWatchlist
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20'
          }`}
        >
          {controls.pending.watchlist ? (
            <SpinnerIcon />
          ) : controls.inWatchlist ? (
            <CheckIcon />
          ) : (
            <PlusIcon />
          )}
          {controls.inWatchlist ? 'In watchlist' : 'Add to watchlist'}
        </button>

        <button
          type="button"
          onClick={controls.toggleFavorite}
          disabled={controls.pending.favorite}
          aria-pressed={controls.favorite}
          className={`${base} ${
            controls.favorite
              ? 'bg-netflix-red text-white hover:bg-netflix-red/90'
              : 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20'
          }`}
        >
          {controls.pending.favorite ? (
            <SpinnerIcon />
          ) : (
            <HeartIcon filled={controls.favorite} />
          )}
          {controls.favorite ? 'Favorited' : 'Favorite'}
        </button>

        {controls.watched && (
          <button
            type="button"
            onClick={controls.markRewatch}
            disabled={controls.pending.watched}
            className={`${base} bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20`}
          >
            <EyeIcon />
            Log a rewatch
          </button>
        )}
      </div>

      {controls.mirrorWarning && (
        <p className="text-sm text-amber-400">{controls.mirrorWarning}</p>
      )}
    </div>
  );
}

/** Exposed so the detail page can drive "mark watched with a rating" from its star row. */
export function useWatchedRating(movieId: number, mediaType: MediaType = 'movie') {
  const controls = useLibraryControls(movieId, mediaType);
  return {
    watched: controls.watched,
    isPending: controls.pending.watched,
    rate: (rating: number) => controls.toggleWatched(rating),
  };
}
