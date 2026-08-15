import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tmdbAccounts } from '@/lib/db/schema';
import { BadRequestError, withUser } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth/session';
import { isBridgeEmail } from '@/lib/auth/tmdb-bridge';
import { decryptSecret } from '@/lib/crypto';
import * as tmdbServer from '@/lib/tmdb-server';

export const dynamic = 'force-dynamic';

/** Whether this account is connected to TMDB, and to whom. */
export const GET = withUser(async (userId) => {
  const user = await getCurrentUser();
  const [row] = await db
    .select({
      tmdbAccountId: tmdbAccounts.tmdbAccountId,
      username: tmdbAccounts.username,
      name: tmdbAccounts.name,
      isPrimaryLogin: tmdbAccounts.isPrimaryLogin,
      linkedAt: tmdbAccounts.linkedAt,
    })
    .from(tmdbAccounts)
    .where(eq(tmdbAccounts.userId, userId))
    .limit(1);

  return {
    linked: Boolean(row),
    account: row ?? null,
    /**
     * True while the account still uses its TMDB placeholder address, meaning
     * TMDB is the only way in and disconnecting is blocked until real
     * credentials are set.
     */
    needsCredentials: Boolean(user && isBridgeEmail(user.email)),
  };
});

/**
 * Disconnects TMDB. The user's library is untouched — it lives in our database
 * and never depended on TMDB in the first place. Future changes simply stop
 * being mirrored.
 */
export const DELETE = withUser(async (userId) => {
  // An account created through "Continue with TMDB" has no password the user
  // knows, so unlinking would lock them out permanently. Make them set real
  // credentials first.
  const user = await getCurrentUser();
  if (user && isBridgeEmail(user.email)) {
    throw new BadRequestError(
      'Add an email address and password to your account before disconnecting TMDB — it is currently your only way to sign in.'
    );
  }

  const [row] = await db
    .delete(tmdbAccounts)
    .where(eq(tmdbAccounts.userId, userId))
    .returning({ sessionId: tmdbAccounts.sessionId, isPrimaryLogin: tmdbAccounts.isPrimaryLogin });

  if (!row) return { unlinked: false };

  // Best effort: invalidate the session on TMDB's side too.
  try {
    await tmdbServer.deleteSession(decryptSecret(row.sessionId));
  } catch (error) {
    console.error('[tmdb/link] could not revoke TMDB session', error);
  }

  return { unlinked: true, wasPrimaryLogin: row.isPrimaryLogin };
});
