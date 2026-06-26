import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Module augmentation so `session.user` and the JWT carry our custom
 * `id` and `role` fields with proper types (no `any`).
 */
declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
