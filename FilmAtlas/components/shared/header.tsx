'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/use-session';
import { SearchModal } from '@/components/ui/search-modal';
import { MobileNav } from '@/components/shared/mobile-nav';
import { Logo } from '@/components/shared/logo';

const BROWSE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Series' },
  { href: '/discover', label: 'Discover' },
];

const LIBRARY_LINKS = [
  { href: '/watched', label: 'Watched' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/favorites', label: 'Favorites' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isLoading, user } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = isAuthenticated ? [...BROWSE_LINKS, ...LIBRARY_LINKS] : BROWSE_LINKS;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-netflix-black/95 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Cineast home" className="flex items-center">
            <Logo className="transition-opacity hover:opacity-80" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <SearchModal />

          {/* Render neutral UI until the session resolves, so neither state flashes. */}
          {isLoading ? (
            <div className="hidden h-8 w-8 rounded-full bg-white/10 lg:block" aria-hidden />
          ) : isAuthenticated ? (
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-8 w-8 items-center justify-center rounded-full bg-netflix-red font-bold transition-opacity hover:opacity-80 lg:flex"
            >
              {(user?.name || user?.email || 'A')[0].toUpperCase()}
            </Link>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold transition-colors hover:text-gray-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded bg-netflix-red px-4 py-2 text-sm font-semibold transition-colors hover:bg-netflix-red/90"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Account actions and every link live in the drawer below lg. */}
          <MobileNav browseLinks={BROWSE_LINKS} libraryLinks={LIBRARY_LINKS} />
        </div>
      </div>

    </motion.header>
  );
}

function NavLink({
  href,
  label,
  className = '',
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  // Exact match for "/", prefix match elsewhere so /tv/1399 keeps TV Series lit.
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`text-sm transition-colors ${
        isActive ? 'font-semibold text-white' : 'text-gray-300 hover:text-white'
      } ${className}`}
    >
      {label}
    </Link>
  );
}
