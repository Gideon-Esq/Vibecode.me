"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Loader2, CheckCircle2, Users } from "lucide-react";
import type { AdminRegistration } from "@/lib/admin";

/** Loads every page of a filtered registrations query. */
async function loadAll(query: string): Promise<AdminRegistration[]> {
  const rows: AdminRegistration[] = [];
  let page = 1;
  // Guard against runaway loops.
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

export function AttendanceList({
  canMarkAll = true,
}: {
  /** When false (registration team), the bulk "Mark all present" action is hidden. */
  canMarkAll?: boolean;
}) {
  const [all, setAll] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  // "" = all confirmed, "PRESENT" = attended, "ABSENT" = not yet marked.
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setAll(await loadAll("status=CONFIRMED&sortBy=fullName&sortDir=asc"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter((r) => {
      if (attendanceFilter === "PRESENT" && !r.attended) return false;
      if (attendanceFilter === "ABSENT" && r.attended) return false;
      if (
        term &&
        !r.fullName.toLowerCase().includes(term) &&
        !r.email.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [all, q, attendanceFilter]);

  const presentCount = all.filter((r) => r.attended).length;

  const setAttended = async (id: string, attended: boolean) => {
    setSavingId(id);
    // optimistic
    setAll((prev) => prev.map((r) => (r.id === id ? { ...r, attended } : r)));
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended }),
      });
      if (!res.ok) {
        // revert on failure
        setAll((prev) => prev.map((r) => (r.id === id ? { ...r, attended: !attended } : r)));
      }
    } finally {
      setSavingId(null);
    }
  };

  const markAllPresent = async () => {
    const pending = filtered.filter((r) => !r.attended);
    if (pending.length === 0) return;
    if (!window.confirm(`Mark ${pending.length} attendees as present?`)) return;
    setAll((prev) =>
      prev.map((r) => (pending.some((p) => p.id === r.id) ? { ...r, attended: true } : r))
    );
    await Promise.all(
      pending.map((r) =>
        fetch(`/api/admin/registrations/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attended: true }),
        })
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm shadow-card">
          <Users className="h-5 w-5 text-green" />
          <span className="font-semibold text-navy">{presentCount}</span>
          <span className="text-ink/60">of {all.length} present</span>
        </div>
        <div className="flex flex-1 items-center gap-3 sm:justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email…"
              className="w-full rounded-xl border border-navy/15 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          <select
            aria-label="Attendance filter"
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="shrink-0 rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">All confirmed</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
          </select>
          {canMarkAll && (
            <button
              type="button"
              onClick={markAllPresent}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green px-4 py-2.5 text-sm font-medium text-white hover:bg-green-dark"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark all present
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
        {loading ? (
          <div className="py-16 text-center text-ink/50">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-ink/50">
            No confirmed registrations{q || attendanceFilter ? " match your filters" : ""}.
          </div>
        ) : (
          <ul className="divide-y divide-navy/5">
            {filtered.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors odd:bg-white even:bg-navy/[0.035] hover:bg-gold/10"
              >
                <span className="w-7 shrink-0 text-right text-xs text-ink/40">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-navy">{r.fullName}</p>
                  <p className="truncate text-xs text-ink/55">
                    {r.institution} · {r.phone}
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
                  {savingId === r.id && <Loader2 className="h-4 w-4 animate-spin text-ink/40" />}
                  <span className={r.attended ? "text-green" : "text-ink/50"}>
                    {r.attended ? "Present" : "Absent"}
                  </span>
                  <input
                    type="checkbox"
                    checked={r.attended}
                    onChange={(e) => setAttended(r.id, e.target.checked)}
                    className="h-5 w-5 accent-green"
                    aria-label={`Mark ${r.fullName} present`}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
