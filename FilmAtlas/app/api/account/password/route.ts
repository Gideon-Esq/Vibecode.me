import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tmdbAccounts } from '@/lib/db/schema';
import { auth } from '@/lib/auth/server';
import { deriveBridgePassword } from '@/lib/auth/tmdb-bridge';
import { BadRequestError, readJson, withUser } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * Sets a password the user actually knows, on an account created through
 * "Continue with TMDB".
 *
 * Those accounts already have a password — one derived from TMDB_BRIDGE_SECRET
 * that the user has never seen. Only the server can supply it as the
 * `currentPassword` that Better Auth requires, which is why this can't be done
 * from the browser.
 */
export const POST = withUser(async (userId, request) => {
  const body = await readJson(request);

  const newPassword = typeof body.password === 'string' ? body.password : '';
  if (newPassword.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters.');
  }

  const [account] = await db
    .select({ tmdbAccountId: tmdbAccounts.tmdbAccountId })
    .from(tmdbAccounts)
    .where(eq(tmdbAccounts.userId, userId))
    .limit(1);

  if (!account) {
    throw new BadRequestError(
      'This account has no linked TMDB account, so it already uses a password you chose. Use "forgot password" to change it.'
    );
  }

  const { error } = await auth.changePassword({
    currentPassword: deriveBridgePassword(account.tmdbAccountId),
    newPassword,
    revokeOtherSessions: true,
  });

  if (error) {
    // The derived password stops working once a real one has been set, which is
    // the common reason to land here on a second attempt.
    throw new BadRequestError(
      'Could not set the password. If you have already set one, use "forgot password" instead.'
    );
  }

  return { ok: true };
});
