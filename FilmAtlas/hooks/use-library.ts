'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import type { MovieRow } from '@/lib/db/schema';

export type MediaType = 'movie' | 'tv';

/** Entries are `"movie-550"` / `"tv-1399"` — a bare id is ambiguous across types. */
export interface LibrarySummary {
  watchlist: string[];
  favorites: string[];
  watched: string[];
}

export function mediaKey(id: number, type: MediaType = 'movie'): string {
  return `${type}-${id}`;
}

export interface WatchedStats {
  totalWatched: number;
  totalMinutes: number;
  totalRewatches: number;
  averageRating: number | null;
  watchedThisYear: number;
}

export interface WatchedEntry {
  movie: MovieRow;
  watchedAt: string;
  rating: number | null;
  rewatchCount: number;
  notes: string | null;
}

export interface MirrorResult {
  mirrored: boolean;
  mirrorError?: string;
}

export const libraryKeys = {
  summary: ['library', 'summary'] as const,
  watchlist: ['library', 'watchlist'] as const,
  favorites: ['library', 'favorites'] as const,
  watched: ['library', 'watched'] as const,
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

/**
 * The whole library as id lists, fetched once and reused by every card on screen.
 */
export function useLibrarySummary() {
  const { isAuthenticated } = useSession();

  const query = useQuery({
    queryKey: libraryKeys.summary,
    queryFn: () => api<LibrarySummary>('/api/library'),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const summary = query.data;

  return {
    ...query,
    isInWatchlist: useCallback(
      (id: number, type: MediaType = 'movie') =>
        summary?.watchlist.includes(mediaKey(id, type)) ?? false,
      [summary]
    ),
    isFavorite: useCallback(
      (id: number, type: MediaType = 'movie') =>
        summary?.favorites.includes(mediaKey(id, type)) ?? false,
      [summary]
    ),
    isWatched: useCallback(
      (id: number, type: MediaType = 'movie') =>
        summary?.watched.includes(mediaKey(id, type)) ?? false,
      [summary]
    ),
  };
}

type ListName = 'watchlist' | 'favorites';

interface ToggleInput {
  movieId: number;
  mediaType?: MediaType;
  isOn: boolean;
}

/**
 * Toggles a title in a list with an optimistic update, so the badge flips
 * instantly and rolls back if the server rejects it.
 */
function useListToggle(list: ListName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, mediaType = 'movie', isOn }: ToggleInput) =>
      api<MirrorResult>(`/api/${list}`, {
        method: isOn ? 'POST' : 'DELETE',
        body: JSON.stringify({ movieId, mediaType }),
      }),

    onMutate: async ({ movieId, mediaType = 'movie', isOn }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.summary });
      const previous = queryClient.getQueryData<LibrarySummary>(libraryKeys.summary);

      queryClient.setQueryData<LibrarySummary>(libraryKeys.summary, (current) => {
        if (!current) return current;
        const keys = new Set(current[list]);
        if (isOn) keys.add(mediaKey(movieId, mediaType));
        else keys.delete(mediaKey(movieId, mediaType));
        return { ...current, [list]: [...keys] };
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.summary, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.summary });
      queryClient.invalidateQueries({ queryKey: libraryKeys[list] });
    },
  });
}

export const useWatchlistToggle = () => useListToggle('watchlist');
export const useFavoriteToggle = () => useListToggle('favorites');

export interface WatchedUpdate {
  movieId: number;
  mediaType?: MediaType;
  rating?: number | null;
  notes?: string | null;
  watchedAt?: string;
  incrementRewatch?: boolean;
}

export function useWatchedMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: libraryKeys.summary });
    queryClient.invalidateQueries({ queryKey: libraryKeys.watched });
  };

  const markWatched = useMutation({
    mutationFn: (update: WatchedUpdate) =>
      api<MirrorResult>('/api/watched', {
        method: 'POST',
        body: JSON.stringify(update),
      }),

    onMutate: async ({ movieId, mediaType = 'movie' }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.summary });
      const previous = queryClient.getQueryData<LibrarySummary>(libraryKeys.summary);
      const key = mediaKey(movieId, mediaType);

      queryClient.setQueryData<LibrarySummary>(libraryKeys.summary, (current) =>
        current && !current.watched.includes(key)
          ? { ...current, watched: [...current.watched, key] }
          : current
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.summary, context.previous);
      }
    },
    onSettled: invalidate,
  });

  const unmarkWatched = useMutation({
    mutationFn: ({
      movieId,
      mediaType = 'movie',
    }: {
      movieId: number;
      mediaType?: MediaType;
    }) =>
      api<MirrorResult>('/api/watched', {
        method: 'DELETE',
        body: JSON.stringify({ movieId, mediaType }),
      }),

    onMutate: async ({ movieId, mediaType = 'movie' }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.summary });
      const previous = queryClient.getQueryData<LibrarySummary>(libraryKeys.summary);
      const key = mediaKey(movieId, mediaType);

      queryClient.setQueryData<LibrarySummary>(libraryKeys.summary, (current) =>
        current
          ? { ...current, watched: current.watched.filter((entry) => entry !== key) }
          : current
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.summary, context.previous);
      }
    },
    onSettled: invalidate,
  });

  return { markWatched, unmarkWatched };
}

export function useWatchedList() {
  const { isAuthenticated } = useSession();

  return useQuery({
    queryKey: libraryKeys.watched,
    queryFn: () =>
      api<{ entries: WatchedEntry[]; stats: WatchedStats }>('/api/watched'),
    enabled: isAuthenticated,
  });
}

export function useWatchlist() {
  const { isAuthenticated } = useSession();

  return useQuery({
    queryKey: libraryKeys.watchlist,
    queryFn: () => api<{ movies: MovieRow[] }>('/api/watchlist'),
    enabled: isAuthenticated,
  });
}

export function useFavorites() {
  const { isAuthenticated } = useSession();

  return useQuery({
    queryKey: libraryKeys.favorites,
    queryFn: () => api<{ movies: MovieRow[] }>('/api/favorites'),
    enabled: isAuthenticated,
  });
}

export interface TmdbLinkStatus {
  linked: boolean;
  account: {
    tmdbAccountId: number;
    username: string;
    name: string | null;
    isPrimaryLogin: boolean;
    linkedAt: string;
  } | null;
  /** Account still uses its TMDB placeholder address, so TMDB is the only way in. */
  needsCredentials: boolean;
}

export function useTmdbLink() {
  const { isAuthenticated } = useSession();
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: ['tmdb', 'link'],
    queryFn: () => api<TmdbLinkStatus>('/api/tmdb/link'),
    enabled: isAuthenticated,
  });

  const unlink = useMutation({
    mutationFn: () => api<{ unlinked: boolean }>('/api/tmdb/link', { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tmdb', 'link'] }),
  });

  return { status, unlink };
}
