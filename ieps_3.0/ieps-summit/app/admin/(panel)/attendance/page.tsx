import { requireAdmin, isPrivileged } from "@/lib/admin";
import { AttendanceList } from "@/components/admin/AttendanceList";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const session = await requireAdmin();
  // Only full admins get the bulk "Mark all present" action; the registration
  // team marks attendees one by one to avoid accidental mass-marking.
  const canMarkAll = session ? isPrivileged(session.user.role) : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Attendance</h1>
        <p className="text-sm text-ink/60">
          Mark confirmed attendees present on the day. Changes save instantly.
        </p>
      </div>
      <AttendanceList canMarkAll={canMarkAll} />
    </div>
  );
}
