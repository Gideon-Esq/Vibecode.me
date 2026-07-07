import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const UnlockScreen = () => {
  const { unlock } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsUnlocking(true);
    setError(false);

    // Small delay to allow UI to update
    await new Promise(r => setTimeout(r, 100));

    const success = await unlock(password);
    if (!success) {
      setError(true);
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper paper-grain flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-ink text-paper flex items-center justify-center mb-4 shadow-xl">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-serif text-ink mb-1">Welcome Back</h1>
          <p className="text-ink/60 font-sans">Enter your password to unlock your journal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              className={`w-full bg-white/50 border-2 ${error ? 'border-red-500' : 'border-ink/10 focus:border-ink/30'} rounded-lg px-4 py-4 text-lg outline-none transition-colors`}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm animate-shake">
              <AlertCircle size={16} />
              <span>Incorrect password</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUnlocking || !password}
            className="w-full bg-ink text-paper py-4 rounded-lg font-medium text-lg flex items-center justify-center gap-2 hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnlocking ? (
              <span>Unlocking...</span>
            ) : (
              <>
                Unlock Journal <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
