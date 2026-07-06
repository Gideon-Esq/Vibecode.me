"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * Shown when a decoded JWT session no longer maps to a live account (e.g. the
 * account was deleted or its access revoked by a super admin). It performs a
 * real client sign-out to clear the stale session cookie, then lands the user
 * on the login page. Without clearing the cookie, the edge middleware would
 * keep treating them as "logged in" and bounce them in a redirect loop.
 */
export function SessionInvalidated() {
  useEffect(() => {
    signOut({ callbackUrl: "/admin/login" });
  }, []);

  return (
    <div className="grid min-h-[100svh] place-items-center bg-offwhite p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-navy/50" />
        <div>
          <p className="font-display text-lg font-semibold text-navy">
            Your session has ended
          </p>
          <p className="mt-1 text-sm text-ink/60">Signing you out…</p>
        </div>
      </div>
    </div>
  );
}
