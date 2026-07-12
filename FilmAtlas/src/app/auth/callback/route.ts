import { TMDBService } from '@/lib/tmdb';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestToken = searchParams.get('request_token');
  // TMDB usually sends 'approved=true' if successful. 'denied=true' if not.
  const approved = searchParams.get('approved');

  if (!requestToken || approved !== 'true') {
    return redirect('/?error=auth_failed');
  }

  try {
    const { session_id } = await TMDBService.createSessionId(requestToken);

    const cookieStore = await cookies();
    cookieStore.set('tmdb_session_id', session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

  } catch (error) {
    console.error('Auth error:', error);
    return redirect('/?error=session_creation_failed');
  }

  return redirect('/');
}
