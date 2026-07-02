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
      const isOnLogin = nextUrl.pathname.startsWith("/admin/login");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      // Already-authenticated users shouldn't see the login screen.
      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // Everything else under /admin requires a session.
      if (isOnAdmin) {
        return isLoggedIn;
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
