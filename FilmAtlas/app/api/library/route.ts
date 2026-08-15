import { getLibrarySummary } from '@/lib/library';
import { withUser } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * Every movie id in the user's library, in one request.
 *
 * The client caches this and every MovieCard checks membership locally, so
 * showing "already watched" badges across a grid costs zero extra requests.
 */
export const GET = withUser((userId) => getLibrarySummary(userId));
