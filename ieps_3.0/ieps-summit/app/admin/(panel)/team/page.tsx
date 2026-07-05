import { redirect } from "next/navigation";
import { requireRole } from "@/lib/admin";
import { TeamAccounts } from "@/components/admin/TeamAccounts";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  // Account management is strictly for super admins.
  const session = await requireRole("SUPER_ADMIN");
  if (!session) redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Team accounts</h1>
        <p className="text-sm text-ink/60">
          Create and manage admin logins. Registration-team accounts can only
          mark attendance and view registrations — no certificates or email.
        </p>
      </div>
      <TeamAccounts currentUserId={session.user.id} />
    </div>
  );
}
