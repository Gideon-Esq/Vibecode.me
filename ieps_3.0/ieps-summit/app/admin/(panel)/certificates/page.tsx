import { CertificatesPanel } from "@/components/admin/CertificatesPanel";

export const dynamic = "force-dynamic";

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Certificates</h1>
        <p className="text-sm text-ink/60">
          Generate and email Certificates of Participation to attendees.
        </p>
      </div>
      <CertificatesPanel />
    </div>
  );
}
