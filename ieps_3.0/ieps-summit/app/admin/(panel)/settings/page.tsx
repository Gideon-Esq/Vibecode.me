import { redirect } from "next/navigation";
import { requireRole } from "@/lib/admin";
import { EVENT, CONTACT } from "@/lib/constants";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireRole("ADMIN", "SUPER_ADMIN");
  if (!session) redirect("/admin/attendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-ink/60">
          Broadcast messaging and event configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <BroadcastForm />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-bold text-navy">
              Signed in as
            </h2>
            <p className="mt-2 text-sm text-ink/80">{session?.user.name}</p>
            <p className="text-sm text-ink/55">{session?.user.email}</p>
            <p className="mt-1 inline-block rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-semibold text-navy">
              {session?.user.role}
            </p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
            <h2 className="font-display text-base font-bold text-navy">Event</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-green">Date</dt>
                <dd className="text-ink/80">{EVENT.dateLabel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-green">Venue</dt>
                <dd className="text-ink/80">
                  {EVENT.venue.name}, {EVENT.venue.city}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-green">Coordinator</dt>
                <dd className="text-ink/80">{CONTACT.name}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
