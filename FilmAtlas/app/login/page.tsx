'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthService } from '@/lib/tmdb';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const tokenData = await AuthService.getRequestToken();
      
      if (tokenData.success) {
        // Store token temporarily
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('request_token', tokenData.request_token);
          // Redirect to TMDB auth
          const authUrl = AuthService.getAuthUrl(tokenData.request_token);
          window.location.href = authUrl;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to initiate login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full glassmorphism p-8 rounded-lg space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-netflix-red mb-2">FILMATLAS</h1>
          <p className="text-gray-300">Sign in to access your personal movie atlas</p>
        </div>

        <div className="space-y-4">
          <div className="bg-netflix-gray-dark p-6 rounded-lg space-y-3">
            <h2 className="font-semibold text-lg">What you'll get:</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-netflix-red mt-1">✓</span>
                <span>Create and manage your personal watchlist</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-netflix-red mt-1">✓</span>
                <span>Save your favorite movies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-netflix-red mt-1">✓</span>
                <span>Rate movies and get recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-netflix-red mt-1">✓</span>
                <span>Create custom movie lists</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-netflix-red hover:bg-netflix-red/90 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold rounded-md transition-colors"
          >
            {isLoading ? 'Redirecting...' : 'Sign in with TMDB'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            You'll be redirected to TMDB to authenticate. Don't have an account?{' '}
            <a
              href="https://www.themoviedb.org/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-netflix-red hover:underline"
            >
              Create one here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
