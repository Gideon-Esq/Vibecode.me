import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Input } from './Input';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(async () => {
        const success = await login(password);
        if (!success) {
          setError('Invalid password.');
          setLoading(false);
        }
    }, 100);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unlock Vault</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your Master Password to decrypt your journal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            label="Master Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoFocus
          />
          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? 'Decrypting...' : 'Unlock'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
