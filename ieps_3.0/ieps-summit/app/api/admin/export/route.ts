import * as XLSX from "xlsx";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireRole, forbidden } from "@/lib/admin";
import { exportToCSV, toAoa, type ExportRegistration } from "@/lib/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/export — CSV (default) or XLSX (?format=xlsx) of all registrations. */
export async function GET(request: Request) {
  if (!(await requireRole("ADMIN", "SUPER_ADMIN"))) return forbidden();

  const rows = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      email: true,
      phone: true,
      institution: true,
      department: true,
      level: true,
      role: true,
      gender: true,
      status: true,
      attended: true,
      certificateUrl: true,
      createdAt: true,
      sessionInterest: { select: { sessionName: true } },
    },
  });

  const data: ExportRegistration[] = rows.map((r) => ({
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    institution: r.institution,
    department: r.department,
    level: r.level,
    role: r.role,
    sessions: r.sessionInterest.map((s) => s.sessionName),
    gender: r.gender,
    status: r.status,
    attended: r.attended,
    certificateUrl: r.certificateUrl,
    createdAt: r.createdAt,
  }));

  const stamp = format(new Date(), "yyyy-MM-dd");
  const wantsXlsx =
    new URL(request.url).searchParams.get("format") === "xlsx";

  if (wantsXlsx) {
    const sheet = XLSX.utils.aoa_to_sheet(toAoa(data));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Registrations");
    const buffer: Buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ieps-registrations-${stamp}.xlsx"`,
      },
    });
  }

  // Prepend a BOM so Excel opens UTF-8 CSV correctly.
  const csv = "﻿" + exportToCSV(data);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ieps-registrations-${stamp}.csv"`,
    },
  });
}
