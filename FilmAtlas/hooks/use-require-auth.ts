'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';

/**
 * Redirects to /login when the user is not signed in.
 *
 * The redirect runs in an effect (never during render) and waits for the session
 * to resolve, so a signed-in user isn't bounced to /login on the first paint.
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return { user, isAuthenticated, isLoading, isReady: !isLoading && isAuthenticated };
}
