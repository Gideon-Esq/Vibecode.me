import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(5, "Please enter a longer message")
    .max(3000, "Message is too long"),
});

/** POST /api/contact — emails a contact-form message to the organiser. */
export async function POST(request: Request) {
  // Rate limit — the form sends real email, so keep abuse in check.
  const rl = rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const result = await sendContactEmail(parsed.data);
  if (!result.sent) {
    console.warn("[contact] message not delivered:", result.reason);
    return NextResponse.json(
      {
        error:
          "We couldn't send your message right now. Please email us directly instead.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
