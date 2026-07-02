import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Full NextAuth (Auth.js v5) instance for the Node runtime.
 *
 * Admin-only credentials login: looks the user up in the `User` table and
 * verifies the bcrypt-hashed password. Sessions are JWT-based.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        // Brute-force guard: 10 attempts per email per 15 minutes.
        if (!rateLimit(`login:${email.toLowerCase()}`, 10, 15 * 60 * 1000).ok)
          return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        // Returned object becomes the `user` arg of the jwt callback.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
