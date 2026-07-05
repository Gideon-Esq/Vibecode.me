import { requireAdmin, isPrivileged } from "@/lib/admin";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const session = await requireAdmin();
  const canManage = session ? isPrivileged(session.user.role) : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Registrations</h1>
        <p className="text-sm text-ink/60">
          {canManage
            ? "Search, filter, manage and export every attendee."
            : "Search and view every attendee. Mark attendance from the Attendance tab."}
        </p>
      </div>
      <RegistrationsTable canManage={canManage} />
    </div>
  );
}
