import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { issueCertificate } from "@/lib/certificate-service";

export const runtime = "nodejs";

/** POST /api/admin/generate-certificate — admin-only, single registration. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const registrationId =
    body && typeof body === "object" && "registrationId" in body
      ? (body as { registrationId?: unknown }).registrationId
      : undefined;

  if (typeof registrationId !== "string" || registrationId.length === 0) {
    return NextResponse.json(
      { error: "registrationId is required" },
      { status: 400 }
    );
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { id: true, fullName: true, email: true },
  });

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  try {
    const result = await issueCertificate(registration);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[generate-certificate] failed:", err);
    return NextResponse.json(
      {
        error: "Failed to generate certificate",
        detail: err instanceof Error ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
