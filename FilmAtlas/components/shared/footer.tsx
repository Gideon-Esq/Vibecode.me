import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

const SECTIONS = [
  {
    heading: 'Browse',
    links: [
      { href: '/', label: 'Home' },
      { href: '/movies', label: 'Movies' },
      { href: '/tv', label: 'TV Series' },
      { href: '/discover', label: 'Discover' },
    ],
  },
  {
    heading: 'My Library',
    links: [
      { href: '/watched', label: 'Watched' },
      { href: '/watchlist', label: 'Watchlist' },
      { href: '/favorites', label: 'Favorites' },
      { href: '/account', label: 'Account' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/signup', label: 'Create account' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-netflix-black">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              aria-label="Cineast home"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Logo size="sm" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Track what you&apos;ve watched, plan what&apos;s next, and keep it all
              in sync with TMDB.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <nav key={section.heading} aria-label={section.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                {section.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Cineast. All rights reserved.</p>

          <div className="flex items-center gap-3">
            {/* TMDB's terms require attribution and a statement of non-endorsement. */}
            <TmdbLogo />
            <p className="max-w-md leading-relaxed">
              This product uses the{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 underline underline-offset-2 hover:text-white"
              >
                TMDB
              </a>{' '}
              API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TmdbLogo() {
  return (
    <svg
      viewBox="0 0 273 36"
      className="h-4 w-auto shrink-0"
      role="img"
      aria-label="TMDB"
    >
      <defs>
        <linearGradient id="tmdb-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#90cea1" />
          <stop offset="100%" stopColor="#01b4e4" />
        </linearGradient>
      </defs>
      <rect width="273" height="36" rx="8" fill="url(#tmdb-gradient)" />
      <text
        x="136.5"
        y="25"
        textAnchor="middle"
        fill="#0d253f"
        fontSize="20"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        TMDB
      </text>
    </svg>
  );
}
