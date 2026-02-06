import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/prisma";

// Trusted origins for CORS - uses string wildcards as per project patterns
const trustedOrigins = [
  "http://localhost:*",
  "http://127.0.0.1:*",
  "https://*.dev.vibecode.run",
  "https://*.vibecode.run",
  "https://*.vibecodeapp.com",
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  // Trust specific origins for cross-origin requests
  trustedOrigins,

  // Base path for auth routes (must match the route in index.ts)
  basePath: "/api/auth",

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    // Require name during signup
    requireEmailVerification: false, // Set to true if you want email verification
  },

  // Session configuration
  session: {
    // Session expires in 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Update session expiry on each request
    updateAge: 60 * 60 * 24, // 1 day in seconds
  },

  // User configuration with additional fields
  user: {
    additionalFields: {
      companyName: {
        type: "string",
        required: false,
        input: true, // Allow this field during signup
      },
    },
  },

  // Secret for signing tokens - required in production
  secret: process.env.BETTER_AUTH_SECRET,

  // Base URL for auth callbacks
  baseURL: process.env.BACKEND_URL || "http://localhost:3000",
});

// Export type for auth session
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
