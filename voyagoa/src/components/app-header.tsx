import Link from "next/link";
import { Brand } from "@/components/nav";
import { Icon } from "@/components/icon";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

/**
 * Slim top bar for the signed-in app surfaces. Unlike the marketing {@link Nav},
 * it carries no landing-section links — just the brand, a jump back to the trip
 * list, the "plan new" entry point, and account controls.
 */
export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/92 backdrop-blur-[18px]">
      <div className="mx-auto flex min-h-[64px] w-[min(100%-32px,1280px)] items-center justify-between gap-6">
        <Brand />

        <div className="flex items-center gap-4 text-[0.88rem]">
          <Link
            href="/trips"
            className="font-semibold text-ink transition-colors hover:text-blue"
          >
            My Trips
          </Link>
          <Link
            href="/"
            className="hidden items-center gap-1.5 font-semibold text-blue transition-colors hover:text-blue-dark sm:inline-flex"
          >
            <Icon name="add" className="text-[17px]" />
            Plan a trip
          </Link>
          {user?.name && (
            <span className="hidden max-w-32 truncate text-ink-soft md:inline">{user.name}</span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
