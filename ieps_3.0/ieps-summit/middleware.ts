import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge middleware that protects /admin/*.
 *
 * It uses the edge-safe `authConfig` (no Prisma/bcrypt). The `authorized`
 * callback in that config decides access and redirects unauthenticated users
 * to /admin/login.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on every /admin route (including /admin itself).
  matcher: ["/admin/:path*"],
};
