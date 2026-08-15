import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { consumeFlow } from '@/lib/auth/tmdb-flow';
import {
  resolveTmdbIdentity,
  saveTmdbLink,
  signInWithTmdb,
} from '@/lib/auth/tmdb-bridge';
import { BadRequestError, readJson, toErrorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * Finishes the TMDB flow.
 *
 * This deliberately runs as a same-origin POST from /auth/tmdb rather than
 * directly inside TMDB's redirect. Neon Auth derives the request origin from the
 * `origin`/`referer` header, and during TMDB's cross-site navigation that header
 * says `https://www.themoviedb.org` — which Better Auth rejects as an untrusted
 * origin. Issuing the sign-in from our own page makes the origin our app.
 */
export async function POST(request: Request) {
  try {
    // Consume the flow cookie first so a replayed request can't reuse it.
    const flow = await consumeFlow();
    const body = await readJson(request);

    if (!flow) {
      throw new BadRequestError('This sign-in link expired. Please try again.');
    }
    if (body.approved !== 'true') {
      throw new BadRequestError('TMDB access was declined.');
    }

    // The token echoed back by TMDB must match the one we issued to this browser.
    const returnedToken =
      typeof body.requestToken === 'string' ? body.requestToken : null;
    if (returnedToken && returnedToken !== flow.requestToken) {
      throw new BadRequestError('Sign-in could not be verified. Please try again.');
    }

    const identity = await resolveTmdbIdentity(flow.requestToken);

    if (flow.mode === 'link') {
      const user = await getCurrentUser();
      if (!user) {
        throw new BadRequestError('Your session expired before TMDB could be linked.');
      }
      await saveTmdbLink(user.id, identity, false);
    } else {
      await signInWithTmdb(identity);
    }

    return NextResponse.json({ next: flow.next });
  } catch (error) {
    return toErrorResponse(error);
  }
}
