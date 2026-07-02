"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Registrations", href: "/admin/registrations", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Admin">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gold text-navy"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 px-3 py-4">
      <div className="mb-3 px-2">
        <p className="truncate text-sm font-semibold text-white">
          {user.name ?? "Administrator"}
        </p>
        <p className="truncate text-xs text-white/50">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-red-500/15 hover:text-red-300"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </div>
  );

  const brand = (
    <Link
      href="/admin"
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 px-5 py-5"
    >
      {/* White card keeps the navy logo legible on the dark sidebar. */}
      <span className="inline-flex rounded-lg bg-white px-2.5 py-1.5">
        <Image
          src="/logos/ieps.png"
          alt="IEPS 3.0"
          width={416}
          height={81}
          className="h-6 w-auto"
        />
      </span>
      <span className="rounded-md bg-white/10 px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider text-white/70">
        Admin
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-navy/10 bg-navy px-4 lg:hidden">
        <span className="inline-flex rounded-lg bg-white px-2.5 py-1.5">
          <Image
            src="/logos/ieps.png"
            alt="IEPS 3.0"
            width={416}
            height={81}
            className="h-6 w-auto"
          />
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-dark lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy-dark shadow-xl">
            {brand}
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
