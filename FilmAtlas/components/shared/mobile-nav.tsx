'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession, signOut } from '@/hooks/use-session';
import { Logo } from '@/components/shared/logo';

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Hamburger button plus a slide-in drawer, shown below `lg` where the links
 * don't fit beside the logo.
 */
export function MobileNav({
  browseLinks,
  libraryLinks,
}: {
  browseLinks: NavItem[];
  libraryLinks: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user } = useSession();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation — the drawer would otherwise stay over the new page.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // While open, the drawer owns the viewport: lock the page behind it and let
  // Escape dismiss it.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="p-2 text-white transition-colors hover:text-gray-300 lg:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7h16M4 12h16M4 17h16"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden
            />

            <motion.div
              id="mobile-menu"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col overflow-y-auto bg-netflix-black shadow-2xl outline-none"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <Logo size="sm" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-gray-400 transition-colors hover:text-white"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 px-5 py-6">
                <Section heading="Browse" items={browseLinks} pathname={pathname} />

                {isAuthenticated && (
                  <Section
                    heading="My Library"
                    items={libraryLinks}
                    pathname={pathname}
                    className="mt-8"
                  />
                )}
              </div>

              <div className="border-t border-white/10 px-5 py-5">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 transition-opacity hover:opacity-80"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-netflix-red font-bold">
                        {(user?.name || user?.email || 'A')[0].toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {user?.name || 'My account'}
                        </span>
                        <span className="block truncate text-sm text-gray-400">
                          {user?.email}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut().then(() => setIsOpen(false))}
                      className="w-full rounded-md bg-white/10 py-2.5 text-sm font-semibold ring-1 ring-white/20 transition-colors hover:bg-white/20"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      className="flex-1 rounded-md bg-white/10 py-2.5 text-center text-sm font-semibold ring-1 ring-white/20 transition-colors hover:bg-white/20"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1 rounded-md bg-netflix-red py-2.5 text-center text-sm font-semibold transition-colors hover:bg-netflix-red/90"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({
  heading,
  items,
  pathname,
  className = '',
}: {
  heading: string;
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {heading}
      </h2>
      <ul className="mt-3 space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`block rounded-md px-3 py-2.5 text-lg transition-colors ${
                  isActive
                    ? 'bg-white/10 font-semibold text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
