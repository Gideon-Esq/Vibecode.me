import { requireAdmin } from "@/lib/admin";
import { Sidebar } from "@/components/admin/Sidebar";
import { SessionInvalidated } from "@/components/admin/SessionInvalidated";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defence in depth: middleware already guards /admin/*, but verify here too.
  // A null session here means the JWT decoded but the account no longer exists
  // (e.g. it was deleted by a super admin). The edge middleware can't reach the
  // DB, so it still sees a "valid" token — force a real sign-out to clear the
  // cookie instead of redirecting to /admin/login (which would loop).
  const session = await requireAdmin();
  if (!session) return <SessionInvalidated />;

  return (
    <div className="admin-inter min-h-[100svh] bg-offwhite">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-5 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
