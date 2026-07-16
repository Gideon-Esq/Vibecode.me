import Link from "next/link";
import { Brand } from "@/components/nav";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Plan a trip", href: "/#start" },
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "Destinations", href: "/#destinations" },
    ],
  },
  {
    title: "Inside a plan",
    links: [
      { label: "Budget tracker", href: "/#budget" },
      { label: "Day-by-day itinerary", href: "/#itinerary" },
      { label: "FAQs", href: "/#faqs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About the team", href: "/#team" },
      { label: "My trips", href: "/trips" },
      { label: "Log in", href: "/login" },
      { label: "Contact", href: "mailto:ema@voyagoa.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#081328] py-10 text-[#c8d5ec]">
      <div className="mx-auto w-[min(100%-64px,1280px)]">
        <div className="grid gap-9 md:grid-cols-[1.4fr_repeat(3,0.7fr)]">
          <div>
            <Brand variant="mark" className="text-white" />
            <p className="mt-3.5 max-w-[330px] text-[0.9rem] text-[#9fb0ca]">
              Premium AI travel planning for people who want less spreadsheet work and
              more adventure.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className="grid content-start gap-2.5" aria-label={col.title}>
              <h3 className="mb-1 text-[0.86rem] font-bold text-white">{col.title}</h3>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[0.86rem] text-[#a9b7ce] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#8294b1] sm:flex-row sm:items-center sm:justify-between">
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
