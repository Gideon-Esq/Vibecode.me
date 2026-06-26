import { RegistrationsTable } from "@/components/admin/RegistrationsTable";

export const dynamic = "force-dynamic";

export default function AdminRegistrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Registrations</h1>
        <p className="text-sm text-ink/60">
          Search, filter, manage and export every attendee.
        </p>
      </div>
      <RegistrationsTable />
    </div>
  );
}
