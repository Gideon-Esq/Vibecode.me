import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

/**
 * Roles with full admin powers (certificates, email, exports, deletes, config).
 * The REGISTRATION role is intentionally excluded — it is a restricted,
 * attendance-only role for the on-the-day registration desk team.
 */
export const PRIVILEGED_ROLES = ["ADMIN", "SUPER_ADMIN"] as const satisfies Role[];

/** Returns the session if the caller is an authenticated admin, else null. */
export async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  return session?.user ? session : null;
}

/**
 * Returns the session only if the caller is authenticated AND holds one of the
 * given roles; otherwise null. Route handlers should pair this with
 * `unauthorized()` (no session) or `forbidden()` (wrong role).
 */
export async function requireRole(...roles: Role[]): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;
  if (roles.length && !roles.includes(session.user.role)) return null;
  return session;
}

/** True for ADMIN / SUPER_ADMIN; false for the restricted REGISTRATION role. */
export function isPrivileged(role: Role): boolean {
  return (PRIVILEGED_ROLES as readonly Role[]).includes(role);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Registration row as sent to the admin UI (sessions flattened to strings). */
export type AdminRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  level: string;
  role: string;
  gender: string;
  heardAboutUs: string;
  status: string;
  attended: boolean;
  certificateUrl: string | null;
  certificateSent: boolean;
  createdAt: string;
  sessions: string[];
};

type RawRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  level: string;
  role: string;
  gender: string;
  heardAboutUs: string;
  status: string;
  attended: boolean;
  certificateUrl: string | null;
  certificateSent: boolean;
  createdAt: Date;
  sessionInterest: { sessionName: string }[];
};

export function serializeRegistration(r: RawRegistration): AdminRegistration {
  const { sessionInterest, createdAt, ...rest } = r;
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    sessions: sessionInterest.map((s) => s.sessionName),
  };
}

/** Prisma select that includes everything serializeRegistration needs. */
export const registrationSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  institution: true,
  department: true,
  level: true,
  role: true,
  gender: true,
  heardAboutUs: true,
  status: true,
  attended: true,
  certificateUrl: true,
  certificateSent: true,
  createdAt: true,
  sessionInterest: { select: { sessionName: true } },
} as const;
