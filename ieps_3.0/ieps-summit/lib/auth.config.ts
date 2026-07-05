import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe NextAuth config.
 *
 * This file must NOT import Prisma, bcrypt or any Node-only module because it
 * is consumed by `middleware.ts`, which runs on the Edge runtime. The actual
 * Credentials provider (which needs bcrypt + Prisma) is added in `lib/auth.ts`
 * for the Node route handler only.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  // Providers are injected in lib/auth.ts; keep empty here for the edge bundle.
  providers: [],
  callbacks: {
    /**
     * Runs in middleware for every matched request. Returning `false` makes
     * NextAuth redirect to `pages.signIn` (/admin/login).
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = nextUrl.pathname;
      const isOnLogin = path.startsWith("/admin/login");
      const isOnAdmin = path.startsWith("/admin");

      // Already-authenticated users shouldn't see the login screen. Send the
      // restricted registration team to their landing page, others to /admin.
      if (isOnLogin) {
        if (isLoggedIn) {
          const home =
            auth?.user?.role === "REGISTRATION" ? "/admin/attendance" : "/admin";
          return Response.redirect(new URL(home, nextUrl));
        }
        return true;
      }

      // Everything else under /admin requires a session.
      if (isOnAdmin) {
        if (!isLoggedIn) return false;

        // The registration team is confined to attendance + read-only
        // registrations. Any other /admin route bounces them to attendance.
        if (auth?.user?.role === "REGISTRATION") {
          const allowed =
            path === "/admin/attendance" ||
            path.startsWith("/admin/attendance/") ||
            path === "/admin/registrations" ||
            path.startsWith("/admin/registrations/");
          if (!allowed) {
            return Response.redirect(new URL("/admin/attendance", nextUrl));
          }
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
