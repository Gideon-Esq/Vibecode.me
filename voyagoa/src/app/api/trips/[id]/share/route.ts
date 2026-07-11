import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOwnedTrip } from "@/lib/trips";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const trip = await getOwnedTrip(id, user.id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const shareToken = trip.shareToken ?? randomBytes(16).toString("hex");
    if (!trip.shareToken) {
      await db.trip.update({ where: { id: trip.id }, data: { shareToken } });
    }
    return NextResponse.json({ shareToken });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const trip = await getOwnedTrip(id, user.id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    await db.trip.update({ where: { id: trip.id }, data: { shareToken: null } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}

function handleError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
