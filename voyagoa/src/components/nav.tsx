import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const SECTIONS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how" },
  { label: "Budget", href: "/#budget" },
  { label: "Destinations", href: "/#destinations" },
  { label: "FAQs", href: "/#faqs" },
];

/**
 * `lockup` is the full logo artwork — it carries a near-white background, so it
 * only reads on light surfaces. On dark surfaces use `mark`, whose tile is
 * transparent-cornered and dark enough to sit on navy, paired with a text
 * wordmark that can be coloured for contrast.
 */
export function Brand({
  variant = "lockup",
  className,
}: {
  variant?: "lockup" | "mark";
  className?: string;
}) {
  if (variant === "mark") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-2.5 ${className ?? ""}`}
        aria-label="Voyagoa home"
      >
        <Image
          src="/assets/logo-mark.png"
          alt=""
          width={322}
          height={349}
          className="size-9 w-auto"
        />
        <span className="text-[1.35rem] font-black tracking-tight">voyagoa</span>
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center ${className ?? ""}`} aria-label="Voyagoa home">
      <Image
        src="/assets/logo-lockup.png"
        alt="Voyagoa — Plan Less. Explore More."
        width={1476}
        height={357}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-line/55 bg-white/92 backdrop-blur-[18px]">
      <div className="mx-auto flex min-h-[68px] w-[min(100%-64px,1280px)] items-center justify-between gap-7">
        <Brand />

        <nav className="hidden items-center gap-10 text-[0.88rem] lg:flex" aria-label="Primary navigation">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="text-[#0c1831] transition-colors hover:text-blue">
              {s.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-[0.88rem]">
          {user ? (
            <>
              <Link href="/trips" className="transition-colors hover:text-blue">
                My trips
              </Link>
              <span className="hidden max-w-32 truncate text-ink-soft sm:inline">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden transition-colors hover:text-blue sm:inline">
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[38px] items-center rounded-lg bg-blue px-5 text-[0.84rem] font-extrabold text-white shadow-[0_12px_28px_rgba(17,103,241,0.22)] transition hover:-translate-y-px hover:bg-blue-dark"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
