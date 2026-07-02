"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Download,
  Eye,
  CheckCircle2,
  Award,
  Mail,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import type { AdminRegistration } from "@/lib/admin";
import { ATTENDEE_ROLES, roleLabel } from "@/lib/registration";
import { RegistrationsTableSkeleton } from "@/components/ui/Skeleton";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-ink/10 text-ink/70",
  CONFIRMED: "bg-green/10 text-green",
  CANCELLED: "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-ink/10 text-ink/70"
      }`}
    >
      {status}
    </span>
  );
}

type ApiResponse = {
  rows: AdminRegistration[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const SORTABLE: Record<string, string> = {
  fullName: "fullName",
  institution: "institution",
  role: "role",
  status: "status",
  createdAt: "createdAt",
};

const columnHelper = createColumnHelper<AdminRegistration>();

export function RegistrationsTable() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Viewport-fixed coordinates for the row-actions menu. Fixed positioning
  // keeps the menu visible even when the table has only a row or two — an
  // absolutely-positioned menu would be clipped by the overflow-x container.
  const [menuPos, setMenuPos] = useState<React.CSSProperties>({});
  const [detail, setDetail] = useState<AdminRegistration | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pageSize = 25;

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortDir,
    });
    if (debouncedQ) params.set("q", debouncedQ);
    if (status) params.set("status", status);
    if (role) params.set("role", role);

    try {
      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortDir, debouncedQ, status, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const toggleSort = (id: string) => {
    if (!SORTABLE[id]) return;
    if (sortBy === id) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(id);
      setSortDir("asc");
    }
  };

  /* ── Row actions ─────────────────────────────────────────── */

  const patchRow = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id);
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("Updated.");
        setRefreshKey((k) => k + 1);
      } else {
        showToast("Update failed.");
      }
    } finally {
      setBusyId(null);
    }
  };

  const deleteRow = async (id: string, name: string) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete registration for ${name}? This cannot be undone.`))
      return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Deleted.");
        setRefreshKey((k) => k + 1);
      } else {
        showToast("Delete failed.");
      }
    } finally {
      setBusyId(null);
    }
  };

  const generateCertificate = async (id: string) => {
    setBusyId(id);
    setOpenMenu(null);
    try {
      const res = await fetch("/api/admin/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: id }),
      });
      showToast(res.ok ? "Certificate generated & emailed." : "Certificate failed.");
      if (res.ok) setRefreshKey((k) => k + 1);
    } finally {
      setBusyId(null);
    }
  };

  /* ── Bulk actions ────────────────────────────────────────── */

  const markPageAttended = async () => {
    if (!data?.rows.length) return;
    if (!window.confirm(`Mark all ${data.rows.length} rows on this page as attended?`))
      return;
    setLoading(true);
    await Promise.all(
      data.rows.map((r) =>
        fetch(`/api/admin/registrations/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attended: true }),
        })
      )
    );
    showToast("Marked attended.");
    setRefreshKey((k) => k + 1);
  };

  const generateAll = async () => {
    if (!window.confirm("Generate certificates for ALL attendees marked present?"))
      return;
    showToast("Generating… this can take a moment.");
    const res = await fetch("/api/admin/generate-all-certificates", { method: "POST" });
    if (res.ok) {
      const body = await res.json();
      showToast(`Done: ${body.succeeded}/${body.total} certificates issued.`);
      setRefreshKey((k) => k + 1);
    } else {
      showToast("Bulk generation failed.");
    }
  };

  /* ── Columns ─────────────────────────────────────────────── */

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", { header: "Name" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("phone", { header: "Phone" }),
      columnHelper.accessor("institution", { header: "Institution" }),
      columnHelper.accessor("level", { header: "Level" }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (c) => roleLabel(c.getValue()),
      }),
      columnHelper.accessor("sessions", {
        header: "Sessions",
        enableSorting: false,
        cell: (c) => (
          <span title={c.getValue().join(", ")} className="text-ink/70">
            {c.getValue().length}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (c) => <StatusBadge status={c.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (c) => format(new Date(c.getValue()), "dd MMM yyyy"),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (c) => {
          const row = c.row.original;
          const isBusy = busyId === row.id;
          const isOpen = openMenu === row.id;
          return (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  if (isOpen) {
                    setOpenMenu(null);
                    return;
                  }
                  // Anchor the fixed menu to the trigger; open upward when
                  // there isn't room below (e.g. last row of a short table).
                  const r = e.currentTarget.getBoundingClientRect();
                  const MENU_H = 264; // ~6 items + padding
                  const openUp =
                    r.bottom + MENU_H > window.innerHeight && r.top > MENU_H;
                  setMenuPos(
                    openUp
                      ? {
                          bottom: window.innerHeight - r.top + 6,
                          right: window.innerWidth - r.right,
                        }
                      : { top: r.bottom + 6, right: window.innerWidth - r.right }
                  );
                  setOpenMenu(row.id);
                }}
                aria-label="Row actions"
                aria-expanded={isOpen}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:bg-navy/5"
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </button>
              {isOpen && (
                <>
                  {/* click-outside backdrop */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setOpenMenu(null)}
                    aria-hidden
                  />
                  <div
                    style={menuPos}
                    className="fixed z-30 w-52 overflow-hidden rounded-xl border border-navy/10 bg-white py-1 text-sm shadow-lg"
                  >
                  <MenuItem icon={Eye} onClick={() => { setDetail(row); setOpenMenu(null); }}>
                    View details
                  </MenuItem>
                  {row.status !== "CONFIRMED" && (
                    <MenuItem
                      icon={CheckCircle2}
                      onClick={() => patchRow(row.id, { status: "CONFIRMED" })}
                    >
                      Mark confirmed
                    </MenuItem>
                  )}
                  <MenuItem
                    icon={CheckCircle2}
                    onClick={() => patchRow(row.id, { attended: true })}
                  >
                    Mark attended
                  </MenuItem>
                  <MenuItem icon={Award} onClick={() => generateCertificate(row.id)}>
                    Generate certificate
                  </MenuItem>
                  <a
                    href={`mailto:${row.email}`}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-ink/80 hover:bg-navy/5"
                    onClick={() => setOpenMenu(null)}
                  >
                    <Mail className="h-4 w-4" />
                    Send email
                  </a>
                  <MenuItem
                    icon={Trash2}
                    danger
                    onClick={() => deleteRow(row.id, row.fullName)}
                  >
                    Delete
                  </MenuItem>
                  </div>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busyId, openMenu]
  );

  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or institution…"
            className="w-full rounded-xl border border-navy/15 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} label="Status">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </FilterSelect>
          <FilterSelect value={role} onChange={(v) => { setRole(v); setPage(1); }} label="Role">
            <option value="">All roles</option>
            {ATTENDEE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </FilterSelect>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/api/admin/export"
          className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-medium text-navy hover:bg-navy/5"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
        <a
          href="/api/admin/export?format=xlsx"
          className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-medium text-navy hover:bg-navy/5"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </a>
        <button
          type="button"
          onClick={markPageAttended}
          className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-medium text-navy hover:bg-navy/5"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark page attended
        </button>
        <button
          type="button"
          onClick={generateAll}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-light"
        >
          <Award className="h-4 w-4" />
          Generate all certificates
        </button>
      </div>

      {/* Table */}
      {loading && !data ? (
        <RegistrationsTableSkeleton />
      ) : (
      <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white shadow-card">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-navy/10 bg-offwhite">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const id = header.column.id;
                  const sortable = Boolean(SORTABLE[id]);
                  return (
                    <th
                      key={header.id}
                      onClick={() => sortable && toggleSort(id)}
                      className={`whitespace-nowrap px-4 py-3 font-label text-xs font-semibold uppercase tracking-wide text-navy/60 ${
                        sortable ? "cursor-pointer select-none hover:text-navy" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && sortBy === id &&
                          (sortDir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ))}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-ink/50">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-ink/50">
                  No registrations found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-navy/5 transition-colors last:border-0 odd:bg-white even:bg-navy/[0.035] hover:bg-gold/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-ink/80">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-ink/60">
        <span>
          {data ? (
            <>
              {(data.page - 1) * data.pageSize + (data.rows.length ? 1 : 0)}–
              {(data.page - 1) * data.pageSize + data.rows.length} of {data.total}
            </>
          ) : (
            "—"
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-navy/15 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="px-1">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-navy/15 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {detail && <DetailModal reg={detail} onClose={() => setDetail(null)} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  danger,
}: {
  icon: typeof Eye;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left ${
        danger ? "text-red-600 hover:bg-red-50" : "text-ink/80 hover:bg-navy/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
    >
      {children}
    </select>
  );
}

function DetailModal({
  reg,
  onClose,
}: {
  reg: AdminRegistration;
  onClose: () => void;
}) {
  const rows: [string, string][] = [
    ["Full name", reg.fullName],
    ["Email", reg.email],
    ["Phone", reg.phone],
    ["Gender", reg.gender],
    ["Institution", reg.institution],
    ["Department", reg.department],
    ["Level", reg.level],
    ["Role", roleLabel(reg.role)],
    ["Sessions", reg.sessions.join(", ") || "—"],
    ["Heard via", reg.heardAboutUs],
    ["Status", reg.status],
    ["Attended", reg.attended ? "Yes" : "No"],
    ["Certificate", reg.certificateUrl ? "Issued" : "Not issued"],
    ["Registered", format(new Date(reg.createdAt), "dd MMM yyyy, HH:mm")],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-navy/10 bg-navy px-5 py-4 text-white">
          <h2 className="font-display text-lg font-bold">{reg.fullName}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <dl className="max-h-[70vh] overflow-y-auto p-5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-4 border-b border-navy/5 py-2.5 last:border-0">
              <dt className="w-40 shrink-0 font-label text-xs font-semibold uppercase tracking-wide text-green">
                {label}
              </dt>
              <dd className="text-sm text-ink/85">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
