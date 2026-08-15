import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tmdbAccounts } from '@/lib/db/schema';
import { deriveSecret, encryptSecret } from '@/lib/crypto';
import * as tmdbServer from '@/lib/tmdb-server';
import { auth } from './server';
import type { AccountDetails } from '@/types/tmdb';

/**
 * "Continue with TMDB" as a first-class sign-up method.
 *
 * Neon Auth is a managed Better Auth server, so we cannot register TMDB as a
 * custom provider on it — and TMDB is not OAuth2 anyway, it uses its own
 * request-token approval flow. What we do instead:
 *
 *   1. TMDB verifies the person and hands us their account id.
 *   2. We deterministically derive a hidden email + a 256-bit password from that
 *      id plus TMDB_BRIDGE_SECRET, and use them to create/sign in a Neon Auth user.
 *
 * The credentials are derived, never stored, and never shown to the user — the
 * only way to obtain them is to already hold the server secret. The user gets one
 * ordinary Neon Auth session either way, so the rest of the app has exactly one
 * notion of "signed in".
 *
 * Rotating TMDB_BRIDGE_SECRET orphans TMDB-created accounts, so treat it as
 * permanent. Users who want a real email/password can add one from Account.
 */

/** Domain for placeholder addresses. `.invalid` is reserved by RFC 2606, so it can never be a real inbox. */
const BRIDGE_EMAIL_DOMAIN = 'tmdb.cineast.invalid';

/**
 * Domains used before the app was renamed.
 *
 * A TMDB account's placeholder address is derived, not stored, so dropping the
 * old domain would silently strand anyone who signed up under it: sign-in would
 * look for an address that doesn't exist, and `isBridgeEmail` would stop
 * recognising theirs — letting them disconnect TMDB and lose their only way in.
 */
const LEGACY_BRIDGE_EMAIL_DOMAINS = ['tmdb.filmatlas.invalid'];

const BRIDGE_EMAIL_DOMAINS = [BRIDGE_EMAIL_DOMAIN, ...LEGACY_BRIDGE_EMAIL_DOMAINS];

export function isBridgeEmail(email: string): boolean {
  return BRIDGE_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`));
}

/** Candidate addresses for a TMDB account, current domain first. */
function bridgeEmails(tmdbAccountId: number): string[] {
  return BRIDGE_EMAIL_DOMAINS.map((domain) => `tmdb-${tmdbAccountId}@${domain}`);
}

/**
 * The password a TMDB-created account is given. Exported so the account settings
 * route can supply it as `currentPassword` when the user sets a real one.
 */
export function deriveBridgePassword(tmdbAccountId: number): string {
  return deriveSecret('tmdb-bridge-password', String(tmdbAccountId));
}


export interface TmdbIdentity {
  account: AccountDetails;
  sessionId: string;
}

/**
 * Exchanges an approved TMDB request token for a session and the account behind it.
 */
export async function resolveTmdbIdentity(requestToken: string): Promise<TmdbIdentity> {
  const session = await tmdbServer.createSession(requestToken);
  if (!session.success) {
    throw new Error('TMDB rejected the request token');
  }

  const account = await tmdbServer.getAccountDetails(session.session_id);
  return { account, sessionId: session.session_id };
}

/**
 * Persists the TMDB link for a user, replacing any previous one.
 */
export async function saveTmdbLink(
  userId: string,
  identity: TmdbIdentity,
  isPrimaryLogin: boolean
): Promise<void> {
  const values = {
    userId,
    tmdbAccountId: identity.account.id,
    username: identity.account.username,
    name: identity.account.name || null,
    sessionId: encryptSecret(identity.sessionId),
    isPrimaryLogin,
    linkedAt: new Date(),
  };

  await db
    .insert(tmdbAccounts)
    .values(values)
    .onConflictDoUpdate({ target: tmdbAccounts.userId, set: values });
}

export async function findUserIdByTmdbAccount(
  tmdbAccountId: number
): Promise<string | null> {
  const [row] = await db
    .select({ userId: tmdbAccounts.userId })
    .from(tmdbAccounts)
    .where(eq(tmdbAccounts.tmdbAccountId, tmdbAccountId))
    .limit(1);

  return row?.userId ?? null;
}

/**
 * Signs the visitor in as the app user that owns this TMDB account, creating
 * that user on first use. Sets the Neon Auth session cookie as a side effect.
 */
export async function signInWithTmdb(identity: TmdbIdentity): Promise<void> {
  // Derived from the TMDB account id alone, so the rename left it untouched.
  const password = deriveBridgePassword(identity.account.id);
  const emails = bridgeEmails(identity.account.id);
  const displayName =
    identity.account.name || identity.account.username || 'TMDB user';

  const existingUserId = await findUserIdByTmdbAccount(identity.account.id);

  if (!existingUserId) {
    // First time this TMDB account has been seen — create the app user.
    const { error } = await auth.signUp.email({
      email: emails[0],
      password,
      name: displayName,
    });

    // A user can already exist without a tmdb_accounts row if a previous attempt
    // failed between the two writes. Signing in below recovers that case.
    if (error && !isAlreadyExistsError(error)) {
      throw new Error(error.message || 'Could not create an account from TMDB');
    }
  }

  // Current domain first, then any legacy one, so accounts created before the
  // rename still resolve.
  let signedInUserId: string | null = null;
  let lastError: string | undefined;

  for (const email of emails) {
    const { data, error } = await auth.signIn.email({ email, password });
    if (data?.user) {
      signedInUserId = data.user.id;
      break;
    }
    lastError = error?.message;
  }

  if (!signedInUserId) {
    throw new Error(lastError || 'Could not sign in with TMDB');
  }

  await saveTmdbLink(signedInUserId, identity, true);
}

function isAlreadyExistsError(error: { code?: string; message?: string }): boolean {
  const haystack = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
  return haystack.includes('exist') || haystack.includes('already');
}
