'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useWatchedList, type WatchedEntry } from '@/hooks/use-library';
import { MovieCard } from '@/components/ui/movie-card';
import { MovieCardSkeleton } from '@/components/ui/skeleton';
import { ClockIcon, EyeIcon, StarIcon } from '@/components/ui/icons';
import { formatRuntime, toCardMovie } from '@/lib/movie-shape';

type SortKey = 'recent' | 'rating' | 'title' | 'release';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recently watched' },
  { key: 'rating', label: 'My rating' },
  { key: 'title', label: 'Title' },
  { key: 'release', label: 'Release date' },
];

export default function WatchedPage() {
  const { isReady } = useRequireAuth();
  const { data, isLoading } = useWatchedList();
  const [sort, setSort] = useState<SortKey>('recent');

  const entries = useMemo(
    () => sortEntries(data?.entries ?? [], sort),
    [data?.entries, sort]
  );

  if (!isReady) return null;

  const stats = data?.stats;

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">Already Watched</h1>
        <p className="mt-2 text-gray-400">
          Everything you&apos;ve marked as seen, tracked in your Cineast account.
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<EyeIcon className="w-5 h-5" />}
          label="Movies watched"
          value={stats ? String(stats.totalWatched) : '—'}
        />
        <StatCard
          icon={<ClockIcon className="w-5 h-5" />}
          label="Time watched"
          value={stats ? formatRuntime(stats.totalMinutes) : '—'}
        />
        <StatCard
          icon={<StarIcon className="w-5 h-5" />}
          label="Average rating"
          value={
            stats?.averageRating != null ? `${stats.averageRating.toFixed(1)}/10` : '—'
          }
        />
        <StatCard
          icon={<EyeIcon className="w-5 h-5" />}
          label={`Watched in ${new Date().getFullYear()}`}
          value={stats ? String(stats.watchedThisYear) : '—'}
          hint={
            stats && stats.totalRewatches > 0
              ? `+${stats.totalRewatches} rewatches logged`
              : undefined
          }
        />
      </div>

      {entries.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400 mr-1">Sort by</span>
          {SORTS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              aria-pressed={sort === option.key}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                sort === option.key
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {entries.map((entry) => (
              <MovieCard
                key={`${entry.movie.mediaType}-${entry.movie.id}`}
                movie={toCardMovie(entry.movie)}
                footer={<EntryMeta entry={entry} />}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function sortEntries(entries: WatchedEntry[], sort: SortKey): WatchedEntry[] {
  const sorted = [...entries];

  switch (sort) {
    case 'rating':
      // Unrated entries sink to the bottom rather than sorting as zero.
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case 'title':
      return sorted.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
    case 'release':
      return sorted.sort((a, b) =>
        (b.movie.releaseDate ?? '').localeCompare(a.movie.releaseDate ?? '')
      );
    case 'recent':
    default:
      return sorted.sort(
        (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
      );
  }
}

function EntryMeta({ entry }: { entry: WatchedEntry }) {
  return (
    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
      <span>
        {new Date(entry.watchedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
      {entry.rating != null && (
        <span className="flex items-center gap-0.5 text-yellow-400">
          <StarIcon className="w-3 h-3" />
          {entry.rating}
        </span>
      )}
      {entry.rewatchCount > 1 && <span>· {entry.rewatchCount}×</span>}
      {entry.movie.mediaType === 'tv' && (
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase">TV</span>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="glassmorphism rounded-lg p-5">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glassmorphism rounded-lg py-16 px-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
        <EyeIcon className="w-7 h-7" />
      </div>
      <p className="text-xl font-semibold">Nothing marked as watched yet</p>
      <p className="mt-2 text-gray-400">
        Hit the ✓ on any poster — or open a movie and press{' '}
        <span className="text-white">Mark as watched</span> — and it will show up here.
      </p>
      <Link
        href="/discover"
        className="mt-6 inline-block rounded-md bg-netflix-red px-6 py-3 font-semibold hover:bg-netflix-red/90"
      >
        Discover Movies
      </Link>
    </div>
  );
}
