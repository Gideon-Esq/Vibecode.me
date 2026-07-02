import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

/** Returns the session if the caller is an authenticated admin, else null. */
export async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  return session?.user ? session : null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
