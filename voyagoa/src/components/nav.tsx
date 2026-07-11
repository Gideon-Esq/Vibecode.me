import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 12c6-8 12-8 18 0-6 8-12 8-18 0Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 12h10M12 5v14" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Voyagoa</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/trips"
                className="rounded-full px-4 py-2 text-ink-soft transition hover:bg-paper-soft hover:text-ink"
              >
                My trips
              </Link>
              <span className="hidden text-ink-faint sm:inline">·</span>
              <span className="hidden max-w-32 truncate text-ink-faint sm:inline">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-ink-soft transition hover:bg-paper-soft hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-4 py-2 text-paper transition hover:bg-ink-soft"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
