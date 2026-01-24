'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/tmdb';
import { motion } from 'framer-motion';

export default function AccountPage() {
  const { isAuthenticated, account, logout } = useAuthStore();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await AuthService.deleteSession();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      logout();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>

        <div className="glassmorphism p-8 rounded-lg space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-netflix-red flex items-center justify-center text-4xl font-bold">
              {account?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{account?.username}</h2>
              <p className="text-gray-400">{account?.name || 'TMDB User'}</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 space-y-4">
            <div>
              <p className="text-sm text-gray-400">Account ID</p>
              <p className="font-semibold">{account?.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Language</p>
              <p className="font-semibold">{account?.iso_639_1?.toUpperCase()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Country</p>
              <p className="font-semibold">{account?.iso_3166_1?.toUpperCase()}</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-netflix-red hover:bg-netflix-red/90 font-bold rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/watchlist')}
              className="p-6 glassmorphism rounded-lg text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">My Watchlist</h3>
              <p className="text-sm text-gray-400">View and manage your watchlist</p>
            </button>
            <button
              onClick={() => router.push('/favorites')}
              className="p-6 glassmorphism rounded-lg text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">My Favorites</h3>
              <p className="text-sm text-gray-400">Browse your favorite movies</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
