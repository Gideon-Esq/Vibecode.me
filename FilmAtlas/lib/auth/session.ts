import 'server-only';

import { auth } from './server';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * The single place the rest of the app asks "who is signed in?".
 *
 * Keeping every route handler behind this helper means the auth provider is
 * swappable without touching business logic.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}

/** Thrown by `requireUserId`; mapped to a 401 by `withUser`. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Not signed in');
    this.name = 'UnauthorizedError';
  }
}

export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user.id;
}
