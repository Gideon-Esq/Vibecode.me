import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole, forbidden } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fields safe to return to the client — never the password hash. */
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

/** GET /api/admin/users — list admin accounts (super admin only). */
export async function GET() {
  if (!(await requireRole("SUPER_ADMIN"))) return forbidden();

  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    users: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
  });
}

// Super admins can provision registration-team and admin accounts. Creating
// another SUPER_ADMIN is intentionally left to the seed script.
const createSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Valid email required").max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(["REGISTRATION", "ADMIN"]).default("REGISTRATION"),
});

/** POST /api/admin/users — create an admin account (super admin only). */
export async function POST(request: Request) {
  if (!(await requireRole("SUPER_ADMIN"))) return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, email, password, role } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: userSelect,
    });
    return NextResponse.json(
      { ...user, createdAt: user.createdAt.toISOString() },
      { status: 201 }
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}
