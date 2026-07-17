import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Cap results so a broad query (e.g. a single common name) can't dump the list. */
const MAX_RESULTS = 12;
const MIN_QUERY = 2;

/**
 * GET /api/certificate/search?q=<name> — public certificate lookup.
 *
 * Returns the minimal fields needed to identify the right person (name +
 * institution) for registrations that already have a certificate issued
 * (certificateUrl set). Email, phone and everyone without a certificate are
 * deliberately never exposed, so this can't be used to scrape the attendee
 * list.
 */
export async function GET(request: Request) {
  // Rate limit — a public search endpoint hitting the database.
  const rl = rateLimit(`cert-search:${clientIp(request)}`, 40, 5 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (q.length < MIN_QUERY) {
    return NextResponse.json(
      { error: `Please enter at least ${MIN_QUERY} characters of your name.` },
      { status: 400 }
    );
  }

  const matches = await prisma.registration.findMany({
    where: {
      fullName: { contains: q, mode: "insensitive" },
      // Only surface people whose certificate has actually been issued — the
      // download endpoint 404s otherwise.
      NOT: { certificateUrl: null },
    },
    select: { id: true, fullName: true, institution: true },
    orderBy: { fullName: "asc" },
    // Fetch one extra to detect (but not reveal) that the query was too broad.
    take: MAX_RESULTS + 1,
  });

  const hasMore = matches.length > MAX_RESULTS;

  return NextResponse.json({
    results: matches.slice(0, MAX_RESULTS),
    hasMore,
  });
}
