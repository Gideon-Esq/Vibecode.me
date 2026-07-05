"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  UserPlus,
  Trash2,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  REGISTRATION: "Registration team",
};

const ROLE_STYLE: Record<Role, string> = {
  SUPER_ADMIN: "bg-navy/10 text-navy",
  ADMIN: "bg-gold/20 text-gold-600",
  REGISTRATION: "bg-green/10 text-green",
};

export function TeamAccounts({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"REGISTRATION" | "ADMIN">("REGISTRATION");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const body = await res.json();
        setUsers(body.users);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
        setRole("REGISTRATION");
        showToast("Account created.");
        await load();
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not create the account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (
      !window.confirm(
        `Delete the account for ${user.name} (${user.email})? This cannot be undone.`
      )
    )
      return;
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Account deleted.");
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        const body = await res.json().catch(() => null);
        showToast(body?.error ?? "Delete failed.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Create account */}
      <form
        onSubmit={createUser}
        className="h-fit space-y-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green" />
          <h2 className="font-display text-base font-bold text-navy">
            New account
          </h2>
        </div>

        <Field label="Full name" icon={UserIcon}>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </Field>

        <Field label="Email" icon={Mail}>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </Field>

        <Field label="Password" icon={Lock}>
          <input
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-ink/40 hover:text-ink/70"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>

        <div>
          <label className="mb-1 block font-label text-xs font-semibold uppercase tracking-wide text-navy/60">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "REGISTRATION" | "ADMIN")}
            className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="REGISTRATION">Registration team (attendance only)</option>
            <option value="ADMIN">Admin (full access)</option>
          </select>
          <p className="mt-1.5 text-xs text-ink/55">
            {role === "REGISTRATION"
              ? "Can search registrations and mark attendance. No certificates, email, exports or settings."
              : "Full access to registrations, attendance, certificates, email and analytics."}
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green px-4 py-2.5 text-sm font-medium text-white hover:bg-green-dark disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Create account
        </button>
      </form>

      {/* Existing accounts */}
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
        <div className="border-b border-navy/10 bg-offwhite px-5 py-3">
          <h2 className="font-display text-base font-bold text-navy">
            Accounts{" "}
            <span className="text-sm font-normal text-ink/50">({users.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-ink/50">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-ink/50">No accounts yet.</div>
        ) : (
          <ul className="divide-y divide-navy/5">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isSuper = u.role === "SUPER_ADMIN";
              const canDelete = !isSelf && !isSuper;
              return (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 odd:bg-white even:bg-navy/[0.02]"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-medium text-navy">
                      {u.name}
                      {isSelf && (
                        <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                          You
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-ink/55">
                      {u.email} · joined {format(new Date(u.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[u.role]}`}
                    >
                      {isSuper && <ShieldCheck className="h-3.5 w-3.5" />}
                      {ROLE_LABEL[u.role]}
                    </span>
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => deleteUser(u)}
                        disabled={deletingId === u.id}
                        aria-label={`Delete ${u.name}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <span className="inline-block h-8 w-8" aria-hidden />
                    )}
                  </div>
                </li>
              );
            })}
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

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block font-label text-xs font-semibold uppercase tracking-wide text-navy/60">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-3 py-2.5 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
        <Icon className="h-4 w-4 shrink-0 text-ink/40" />
        {children}
      </div>
    </div>
  );
}
