import { NextResponse } from 'next/server';
import { request, TmdbError } from '@/lib/tmdb-server';

export const dynamic = 'force-dynamic';

/**
 * Proxies public TMDB reads for the browser client in `lib/tmdb.ts`.
 *
 * The client used to call TMDB directly with `NEXT_PUBLIC_TMDB_API_KEY`, which
 * bundled the key into client-side JS. Routing through here keeps the key
 * server-side (see `lib/tmdb-server.ts`).
 */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const url = new URL(req.url);
  const { path: pathSegments } = await params;
  const path = `/${pathSegments.join('/')}`;
  const searchParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    searchParams[key] = value;
  });

  try {
    const data = await request<unknown>(path, { params: searchParams, revalidate: 300 });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof TmdbError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'TMDB request failed' }, { status: 502 });
  }
}
