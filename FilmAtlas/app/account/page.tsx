'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { signOut } from '@/hooks/use-session';
import { useTmdbLink, useWatchedList } from '@/hooks/use-library';
import { AddCredentials } from '@/components/account/add-credentials';
import { CheckIcon, SpinnerIcon } from '@/components/ui/icons';
import { formatRuntime } from '@/lib/movie-shape';

export default function AccountPage() {
  const { isReady, user } = useRequireAuth();
  const router = useRouter();
  const { status, unlink } = useTmdbLink();
  const { data: watched } = useWatchedList();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isReady || !user) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const linked = status.data?.linked ?? false;
  const tmdbAccount = status.data?.account ?? null;
  const needsCredentials = status.data?.needsCredentials ?? false;
  const stats = watched?.stats;

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <motion.div
        className="max-w-2xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">Account Settings</h1>

        <section className="glassmorphism p-8 rounded-lg space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-netflix-red text-4xl font-bold">
              {(user.name || user.email)[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold truncate">
                {user.name || 'Cineast user'}
              </h2>
              <p className="text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-6 text-center">
              <Stat label="Watched" value={String(stats.totalWatched)} />
              <Stat label="Time" value={formatRuntime(stats.totalMinutes)} />
              <Stat
                label="Avg rating"
                value={stats.averageRating != null ? stats.averageRating.toFixed(1) : '—'}
              />
            </div>
          )}
        </section>

        {/* TMDB connection */}
        <section className="glassmorphism p-8 rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">TMDB connection</h2>
              <p className="mt-1 text-sm text-gray-400">
                Connecting TMDB mirrors your watchlist and favorites to your TMDB
                account. Your Cineast library works either way.
              </p>
            </div>
            {linked && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-400 ring-1 ring-emerald-500/40">
                <CheckIcon className="w-3.5 h-3.5" />
                Connected
              </span>
            )}
          </div>

          {status.isLoading ? (
            <p className="text-sm text-gray-500">Checking…</p>
          ) : linked && tmdbAccount ? (
            <div className="space-y-4">
              <div className="rounded-md bg-black/30 p-4">
                <p className="text-sm text-gray-400">Signed in to TMDB as</p>
                <p className="font-semibold">{tmdbAccount.username}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Connected{' '}
                  {new Date(tmdbAccount.linkedAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {tmdbAccount.isPrimaryLogin && ' · used to sign in'}
                </p>
              </div>

              {needsCredentials ? (
                <div className="rounded-md bg-amber-500/10 p-4 ring-1 ring-amber-500/40">
                  <p className="font-semibold text-amber-300">
                    TMDB is currently your only way to sign in
                  </p>
                  <p className="mt-1 mb-4 text-sm text-gray-300">
                    You created this account with TMDB, so it has no email address or
                    password of its own. Add them below and you&apos;ll be able to
                    disconnect TMDB without losing access.
                  </p>
                  <AddCredentials />
                </div>
              ) : (
                <>
                  {unlink.error && (
                    <p role="alert" className="text-sm text-red-400">
                      {(unlink.error as Error).message}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => unlink.mutate()}
                    disabled={unlink.isPending}
                    className="inline-flex items-center gap-2 rounded-md bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/25 transition-colors hover:bg-white/20 disabled:opacity-60"
                  >
                    {unlink.isPending && <SpinnerIcon />}
                    Disconnect TMDB
                  </button>
                </>
              )}
            </div>
          ) : (
            <a
              href="/api/tmdb/start?mode=link&next=/account"
              className="inline-flex items-center gap-2 rounded-md bg-[#01b4e4] px-5 py-2.5 font-bold text-black transition-opacity hover:opacity-90"
            >
              Connect TMDB
            </a>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Quick Links</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <QuickLink
              href="/watched"
              title="Already Watched"
              description="Your viewing history and stats"
            />
            <QuickLink
              href="/watchlist"
              title="My Watchlist"
              description="What you plan to watch"
            />
            <QuickLink
              href="/favorites"
              title="My Favorites"
              description="The ones you loved"
            />
          </div>
        </section>

        <section className="glassmorphism rounded-lg p-8">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-netflix-red py-3 font-bold transition-colors hover:bg-netflix-red/90 disabled:opacity-60"
          >
            {isSigningOut && <SpinnerIcon />}
            Sign Out
          </button>
        </section>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="glassmorphism block rounded-lg p-6 transition-colors hover:bg-white/5"
    >
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}
