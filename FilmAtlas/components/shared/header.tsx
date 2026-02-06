'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { SearchModal } from '@/components/ui/search-modal';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-netflix-black/95 backdrop-blur-md' : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <h1 className="text-netflix-red text-2xl md:text-3xl font-bold tracking-wider hover:opacity-80 transition-opacity">
              FILMATLAS
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/discover" className="text-sm hover:text-gray-300 transition-colors">
              Discover
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/watchlist" className="text-sm hover:text-gray-300 transition-colors">
                  My List
                </Link>
                <Link href="/favorites" className="text-sm hover:text-gray-300 transition-colors">
                  Favorites
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SearchModal />

          {isAuthenticated ? (
            <Link
              href="/account"
              className="w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center font-bold hover:opacity-80 transition-opacity"
            >
              A
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-netflix-red hover:bg-netflix-red/90 rounded text-sm font-semibold transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
