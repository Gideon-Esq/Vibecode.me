import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole, forbidden } from "@/lib/admin";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

/** DELETE /api/admin/users/[id] — remove an admin account (super admin only). */
export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await requireRole("SUPER_ADMIN");
  if (!session) return forbidden();

  // Never let a super admin delete their own account (lock-out guard).
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Super-admin accounts are protected — they can only be managed via the seed.
  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Super admin accounts cannot be deleted here." },
      { status: 403 }
    );
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
