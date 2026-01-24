import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

interface VaultLockProps {
  mode: 'setup' | 'unlock';
}

export function VaultLock({ mode }: VaultLockProps) {
  const { setupVault, unlockVault } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'setup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        await setupVault(password);
      } else {
        const success = await unlockVault(password);
        if (!success) {
          setError('Invalid password');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-white dark:bg-midnight-slate p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-gold/20 dark:bg-accent-gold/10 mb-4">
            <svg
              className="w-10 h-10 text-accent-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-ink dark:text-paper-white mb-2">
            AuraJournal
          </h1>
          <p className="text-ink-muted dark:text-paper-cream/60 font-sans text-sm">
            {mode === 'setup'
              ? 'Create your vault password'
              : 'Enter your password to unlock'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-sans text-ink-light dark:text-paper-cream/80 mb-1"
            >
              Master Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 min-h-touch rounded-lg border border-ink/10 dark:border-paper-white/10 bg-white dark:bg-midnight-dark text-ink dark:text-paper-white focus:outline-none focus:ring-2 focus:ring-accent-gold/50 font-sans"
              placeholder="Enter your password"
              autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {mode === 'setup' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-sans text-ink-light dark:text-paper-cream/80 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 min-h-touch rounded-lg border border-ink/10 dark:border-paper-white/10 bg-white dark:bg-midnight-dark text-ink dark:text-paper-white focus:outline-none focus:ring-2 focus:ring-accent-gold/50 font-sans"
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm font-sans animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 min-h-touch rounded-lg bg-accent-gold hover:bg-accent-amber text-white font-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>{mode === 'setup' ? 'Creating Vault...' : 'Unlocking...'}</span>
              </>
            ) : (
              <span>{mode === 'setup' ? 'Create Vault' : 'Unlock'}</span>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 p-4 rounded-lg bg-ink/5 dark:bg-paper-white/5">
          <p className="text-xs text-ink-muted dark:text-paper-cream/50 font-sans text-center leading-relaxed">
            🔒 Your password is never stored. All data is encrypted locally on your device using military-grade AES-256 encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
