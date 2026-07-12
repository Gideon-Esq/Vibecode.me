'use server';

import { redirect } from 'next/navigation';
import { TMDBService } from '@/lib/tmdb';
import { cookies } from 'next/headers';

export async function loginAction() {
  try {
    const { request_token } = await TMDBService.getRequestToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${appUrl}/auth/callback`;

    redirect(`https://www.themoviedb.org/authenticate/${request_token}?redirect_to=${redirectUrl}`);
  } catch (error) {
    // redirect throws an error, so we catch others
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    console.error('Login failed:', error);
    throw new Error('Failed to initiate login');
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('tmdb_session_id');
  redirect('/');
}

export async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('tmdb_session_id')?.value;
}
