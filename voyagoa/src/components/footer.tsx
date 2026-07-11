import Link from "next/link";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Plan a trip", href: "/#composer" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "My trips", href: "/trips" },
    ],
  },
  {
    title: "Inside a plan",
    links: [
      { label: "Budget engine", href: "/#budget" },
      { label: "Day-by-day itinerary", href: "/#itinerary" },
      { label: "Everything included", href: "/#features" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-soft/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 12c6-8 12-8 18 0-6 8-12 8-18 0Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 12h10M12 5v14" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                </svg>
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">Voyagoa</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Your entire trip. Planned by AI. One sentence in — flights, hotels,
              food, visas and a day-by-day itinerary out.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-coral-deep"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Voyagoa. All rights reserved.</p>
          <p className="max-w-md leading-relaxed">
            AI-generated estimates are always labeled. Verify prices, availability and
            visa rules with official sources before booking.
          </p>
        </div>
      </div>
    </footer>
  );
}
