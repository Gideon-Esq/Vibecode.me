import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const Onboarding = () => {
  const { setup } = useAuth();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    setIsSettingUp(true);
    await setup(password);
  };

  return (
    <div className="min-h-screen bg-paper paper-grain flex flex-col items-center justify-center p-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-sm"
      >
        {step === 1 ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-ink/5 rounded-full flex items-center justify-center">
              <BookOpen size={40} className="text-ink" />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink mb-2">AuraJournal</h1>
              <p className="text-ink/60 text-lg">Your private thoughts, safe forever.</p>
            </div>
            <div className="space-y-2 text-sm text-ink/50 py-4">
              <p>• Local-first & Encrypted</p>
              <p>• Zero-Knowledge Privacy</p>
              <p>• Unhackable by Design</p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-ink text-paper py-4 rounded-lg font-medium text-lg hover:bg-ink/90 transition-all"
            >
              Start Setup
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-ink text-paper flex items-center justify-center mb-4">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-serif text-ink mb-1">Create Master Password</h2>
              <p className="text-ink/60 text-center text-sm">
                This password encrypts your journal. It is never stored. If you lose it, your data is lost forever.
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password"
                className="w-full bg-white/50 border-2 border-ink/10 focus:border-ink/30 rounded-lg px-4 py-4 text-lg outline-none transition-colors"
                autoFocus
                minLength={8}
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className={`w-full bg-white/50 border-2 ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-ink/10 focus:border-ink/30'} rounded-lg px-4 py-4 text-lg outline-none transition-colors`}
                required
              />

              <div className="text-xs text-ink/40 text-center px-4">
                Must be at least 8 characters.
              </div>

              <button
                type="submit"
                disabled={isSettingUp || !password || password !== confirmPassword}
                className="w-full bg-ink text-paper py-4 rounded-lg font-medium text-lg flex items-center justify-center gap-2 hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSettingUp ? 'Encrypting...' : 'Create Vault'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
