"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Loader2, Download, Send, CheckCircle2 } from "lucide-react";
import type { AdminRegistration } from "@/lib/admin";

async function loadAll(query: string): Promise<AdminRegistration[]> {
  const rows: AdminRegistration[] = [];
  let page = 1;
  for (let i = 0; i < 100; i++) {
    const res = await fetch(`/api/admin/registrations?${query}&pageSize=100&page=${page}`);
    if (!res.ok) break;
    const body = await res.json();
    rows.push(...body.rows);
    if (page >= body.totalPages || body.rows.length === 0) break;
    page += 1;
  }
  return rows;
}

export function CertificatesPanel() {
  const [rows, setRows] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 4000);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await loadAll("attended=true&sortBy=fullName&sortDir=asc"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const issued = rows.filter((r) => r.certificateUrl).length;

  const generateOne = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: id }),
      });
      show(res.ok ? "Certificate generated & emailed." : "Failed.");
      if (res.ok) await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const generateAll = async () => {
    if (rows.length === 0) return;
    if (!window.confirm(`Generate & email certificates for all ${rows.length} attendees?`)) return;
    setBulkBusy(true);
    show("Generating… this can take a moment.");
    try {
      const res = await fetch("/api/admin/generate-all-certificates", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        show(`Done: ${body.succeeded}/${body.total} issued, ${body.emailsSent} emailed.`);
        await refresh();
      } else {
        show("Bulk generation failed.");
      }
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm shadow-card">
          <Award className="h-5 w-5 text-gold-600" />
          <span className="font-semibold text-navy">{issued}</span>
          <span className="text-ink/60">of {rows.length} attendees issued</span>
        </div>
        <button
          type="button"
          onClick={generateAll}
          disabled={bulkBusy || rows.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-50"
        >
          {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
          Generate all certificates
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
        {loading ? (
          <div className="py-16 text-center text-ink/50">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-ink/50">
            No attendees marked present yet. Mark attendance first.
          </div>
        ) : (
          <ul className="divide-y divide-navy/5">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-offwhite/60">
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy">{r.fullName}</p>
                  <p className="truncate text-xs text-ink/55">{r.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.certificateUrl ? (
                    <>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green">
                        <CheckCircle2 className="h-4 w-4" />
                        Issued
                      </span>
                      <a
                        href={r.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-navy/15 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        View
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-ink/45">Not issued</span>
                  )}
                  <button
                    type="button"
                    onClick={() => generateOne(r.id)}
                    disabled={busyId === r.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-gold px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-gold-light disabled:opacity-50"
                  >
                    {busyId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {r.certificateUrl ? "Resend" : "Generate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
