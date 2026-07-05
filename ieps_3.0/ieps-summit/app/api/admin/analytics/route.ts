import { NextResponse } from "next/server";
import { requireRole, forbidden } from "@/lib/admin";
import { getAnalytics } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/analytics — all dashboard KPIs + chart data in one call. */
export async function GET() {
  if (!(await requireRole("ADMIN", "SUPER_ADMIN"))) return forbidden();
  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
