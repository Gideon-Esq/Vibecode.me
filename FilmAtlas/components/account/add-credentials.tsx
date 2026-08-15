'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/client';
import { useSession } from '@/hooks/use-session';
import { SpinnerIcon } from '@/components/ui/icons';

/**
 * Lets a "Continue with TMDB" account add a real email and password.
 *
 * Those accounts are created with a placeholder address and a password derived
 * from a server secret, so TMDB is their only way in — which is why
 * disconnecting TMDB is blocked until this is done.
 *
 * The email change runs from the browser because the Neon server SDK only
 * exposes a fixed set of endpoints and `changeEmail` isn't one of them. The
 * password change must run on the server, because only it can supply the
 * derived current password. Email goes first: the derived password stays valid
 * until it is replaced, so a failure at the second step is safe to retry.
 */
export function AddCredentials({ onDone }: { onDone?: () => void }) {
  const { refetch } = useSession();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSaving(true);

    try {
      const emailResult = await authClient.changeEmail({ newEmail: email });
      if (emailResult.error) {
        setError(emailResult.error.message || 'Could not update your email address.');
        return;
      }

      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(
          `${body.error || 'Could not set your password.'} Your email address was updated, so you can retry just the password.`
        );
        return;
      }

      setNotice(
        'Saved. If your new address needs confirming, check your inbox — you can now sign in with it.'
      );
      setEmail('');
      setPassword('');
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['tmdb', 'link'] });
      onDone?.();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-md bg-red-500/15 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/40">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-emerald-500/15 px-4 py-3 text-sm text-emerald-300 ring-1 ring-emerald-500/40">
          {notice}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="new-email" className="block text-sm font-medium text-gray-300">
          Email address
        </label>
        <input
          id="new-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md bg-netflix-gray-dark px-4 py-3 text-white ring-1 ring-white/10 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-netflix-red"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md bg-netflix-gray-dark px-4 py-3 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-netflix-red"
        />
        <p className="text-xs text-gray-500">At least 8 characters.</p>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-md bg-netflix-red px-5 py-2.5 font-semibold transition-colors hover:bg-netflix-red/90 disabled:opacity-60"
      >
        {isSaving && <SpinnerIcon />}
        Save sign-in details
      </button>
    </form>
  );
}
