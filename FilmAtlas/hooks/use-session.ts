'use client';

import { authClient } from '@/lib/auth/client';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

/**
 * The app's view of "who is signed in".
 *
 * Wrapping the auth client here keeps every component free of provider-specific
 * shapes, and gives one place to add the `isPending` handling that stops a
 * signed-in user from being flashed the signed-out UI on first paint.
 */
export function useSession() {
  const { data, isPending, error, refetch } = authClient.useSession();

  const user = (data?.user ?? null) as SessionUser | null;

  return {
    user,
    /** True until the session has been resolved — render neutral UI while it is. */
    isLoading: isPending,
    isAuthenticated: Boolean(user),
    error,
    refetch,
  };
}

export async function signOut(): Promise<void> {
  await authClient.signOut();
}
