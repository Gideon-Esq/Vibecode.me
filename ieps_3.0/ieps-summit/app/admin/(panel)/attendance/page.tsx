import { AttendanceList } from "@/components/admin/AttendanceList";

export const dynamic = "force-dynamic";

export default function AdminAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Attendance</h1>
        <p className="text-sm text-ink/60">
          Mark confirmed attendees present on the day. Changes save instantly.
        </p>
      </div>
      <AttendanceList />
    </div>
  );
}
