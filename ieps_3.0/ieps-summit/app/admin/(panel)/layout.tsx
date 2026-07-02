import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defence in depth: middleware already guards /admin/*, but verify here too.
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-[100svh] bg-offwhite">
      <Sidebar
        user={{ name: session.user.name, email: session.user.email }}
      />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-5 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
