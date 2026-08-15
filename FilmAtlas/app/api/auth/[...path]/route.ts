import { auth } from '@/lib/auth/server';

/**
 * Proxies the Neon Auth endpoints (sign-in, sign-up, session, sign-out).
 *
 * The handlers are built on first request rather than at module scope so that
 * `next build` can import this route without the auth secrets present.
 */
type Context = { params: Promise<{ path: string[] }> };

let handlers: ReturnType<typeof auth.handler> | null = null;

function getHandlers() {
  return (handlers ??= auth.handler());
}

export const GET = (request: Request, context: Context) =>
  getHandlers().GET(request, context);
export const POST = (request: Request, context: Context) =>
  getHandlers().POST(request, context);
export const PUT = (request: Request, context: Context) =>
  getHandlers().PUT(request, context);
export const PATCH = (request: Request, context: Context) =>
  getHandlers().PATCH(request, context);
export const DELETE = (request: Request, context: Context) =>
  getHandlers().DELETE(request, context);
