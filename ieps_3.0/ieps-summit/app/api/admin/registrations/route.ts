import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  requireAdmin,
  unauthorized,
  serializeRegistration,
  registrationSelect,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTABLE = new Set([
  "createdAt",
  "fullName",
  "status",
  "role",
  "institution",
  "attended",
]);

/** GET /api/admin/registrations — paginated, searchable, filterable list. */
export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();
  const role = searchParams.get("role")?.trim();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize")) || 25)
  );

  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const orderBy: Prisma.RegistrationOrderByWithRelationInput = SORTABLE.has(
    sortBy
  )
    ? { [sortBy]: sortDir }
    : { createdAt: "desc" };

  const where: Prisma.RegistrationWhereInput = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { institution: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as Prisma.RegistrationWhereInput["status"];
  if (role) where.role = role as Prisma.RegistrationWhereInput["role"];

  const attended = searchParams.get("attended");
  if (attended === "true") where.attended = true;
  else if (attended === "false") where.attended = false;

  const [total, rows] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: registrationSelect,
    }),
  ]);

  return NextResponse.json({
    rows: rows.map(serializeRegistration),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
