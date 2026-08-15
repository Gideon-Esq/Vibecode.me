'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { authClient } from '@/lib/auth/client';
import { SpinnerIcon } from '@/components/ui/icons';
import { Logo } from '@/components/shared/logo';
import { safeNext } from '@/lib/next-path';

/**
 * Shared sign-in / sign-up form.
 *
 * Both paths land on the same Neon Auth session, whether the user types an email
 * and password or comes back through TMDB.
 */
export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('tmdb_error')
  );

  const isSignUp = mode === 'signup';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message || 'Could not complete that. Please try again.');
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tmdbHref = `/api/tmdb/start?mode=signin&next=${encodeURIComponent(next)}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div
        className="max-w-md w-full glassmorphism p-8 rounded-lg space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <Logo size="lg" className="mb-2" />
          <p className="text-gray-300">
            {isSignUp
              ? 'Create an account to track everything you watch'
              : 'Welcome back'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md bg-red-500/15 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/40"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Field
              id="name"
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />
          )}

          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />

          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={8}
            hint={isSignUp ? 'At least 8 characters' : undefined}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-netflix-red py-3 font-bold transition-colors hover:bg-netflix-red/90 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {isSubmitting && <SpinnerIcon />}
            {isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-white/15" />
          <span className="text-xs uppercase tracking-wide text-gray-500">or</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <a
          href={tmdbHref}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-[#01b4e4] py-3 font-bold text-black transition-opacity hover:opacity-90"
        >
          <TmdbMark />
          Continue with TMDB
        </a>

        <p className="text-center text-xs text-gray-400">
          Using TMDB creates a Cineast account and keeps your watchlist and
          favorites in sync with TMDB.
        </p>

        <p className="text-center text-sm text-gray-400">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            href={isSignUp ? '/login' : '/signup'}
            className="text-netflix-red hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'id'>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md bg-netflix-gray-dark px-4 py-3 text-white ring-1 ring-white/10 transition-shadow placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-netflix-red"
        {...rest}
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function TmdbMark() {
  return (
    <svg viewBox="0 0 34 12" className="h-3.5" aria-hidden fill="currentColor">
      <rect width="34" height="12" rx="2" fillOpacity="0.15" />
      <text x="17" y="9" textAnchor="middle" fontSize="8" fontWeight="700">
        TMDB
      </text>
    </svg>
  );
}
