import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SESSION_COOKIE = "voyagoa_session";
const SESSION_DAYS = 30;

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  homeCity: string | null;
  passportCountry: string | null;
  preferences: string | null;
};

function toSafeUser(user: {
  id: string;
  email: string;
  name: string;
  homeCity: string | null;
  passportCountry: string | null;
  preferences: string | null;
}): SafeUser {
  const { id, email, name, homeCity, passportCountry, preferences } = user;
  return { id, email, name, homeCity, passportCountry, preferences };
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  homeCity?: string;
  passportCountry?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new AuthError("An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await db.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash,
      homeCity: input.homeCity?.trim() || null,
      passportCountry: input.passportCountry?.trim() || null,
    },
  });
  await createSession(user.id);
  return toSafeUser(user);
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthError("Invalid email or password");
  }
  await createSession(user.id);
  return toSafeUser(user);
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
    jar.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } });
    return null;
  }
  return toSafeUser(session.user);
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not authenticated", 401);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
