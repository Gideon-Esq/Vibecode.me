import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/admin";
import { getAnalytics } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/analytics — all dashboard KPIs + chart data in one call. */
export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
