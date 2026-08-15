import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { appOrigin, beginFlow, safeNextPath } from '@/lib/auth/tmdb-flow';
import { toErrorResponse } from '@/lib/http';
import * as tmdbServer from '@/lib/tmdb-server';

export const dynamic = 'force-dynamic';

/**
 * Kicks off TMDB's approval flow.
 *
 * `mode=signin` signs the visitor in (creating an app account on first use).
 * `mode=link`   attaches TMDB to the account they are already signed in as.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') === 'link' ? 'link' : 'signin';
    const next = safeNextPath(url.searchParams.get('next'));

    if (mode === 'link' && !(await getCurrentUser())) {
      return NextResponse.redirect(new URL('/login', appOrigin(request)));
    }

    const token = await tmdbServer.createRequestToken();
    if (!token.success) {
      throw new Error('TMDB refused to issue a request token');
    }

    await beginFlow({ requestToken: token.request_token, mode, next });

    // A page, not a route handler — see app/api/tmdb/complete/route.ts for why.
    const callbackUrl = `${appOrigin(request)}/auth/tmdb`;
    return NextResponse.redirect(
      tmdbServer.buildApproveUrl(token.request_token, callbackUrl)
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
