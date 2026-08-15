'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Landing page for TMDB's redirect.
 *
 * TMDB sends the browser here, and this page then completes the flow with a
 * same-origin POST. The indirection is required: Neon Auth reads the request
 * origin from the `referer`, which during TMDB's redirect is themoviedb.org and
 * gets rejected as untrusted. A fetch from this page carries our own origin.
 */
function TmdbCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // TMDB request tokens are single-use, so this must not run twice — which
    // React's development StrictMode would otherwise do.
    if (hasStarted.current) return;
    hasStarted.current = true;

    const complete = async () => {
      try {
        const response = await fetch('/api/tmdb/complete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            approved: searchParams.get('approved'),
            requestToken: searchParams.get('request_token'),
          }),
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(body.error || 'TMDB sign-in failed. Please try again.');
          return;
        }

        router.replace(body.next || '/');
        router.refresh();
      } catch {
        setError('Could not reach the server. Please try again.');
      }
    };

    complete();
  }, [searchParams, router]);

  if (error) {
    return (
      <Centered>
        <div className="mb-4 text-6xl">✗</div>
        <p role="alert" className="mb-6 text-xl text-red-400">
          {error}
        </p>
        <button
          type="button"
          onClick={() => router.replace('/login')}
          className="rounded-md bg-netflix-red px-6 py-3 font-semibold hover:bg-netflix-red/90"
        >
          Back to sign in
        </button>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-t-4 border-netflix-red" />
      <p className="text-xl">Finishing sign-in…</p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">{children}</div>
    </div>
  );
}

export default function TmdbCallbackPage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-netflix-red" />
        </Centered>
      }
    >
      <TmdbCallback />
    </Suspense>
  );
}
