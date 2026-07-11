import { Nav } from "@/components/nav";
import { TripComposer } from "@/components/trip-composer";
import { Icon } from "@/components/icon";
import { getCurrentUser } from "@/lib/auth";
import { aiMode } from "@/lib/ai/client";
import { Reveal, CountUp, FillBar, ScrollProgress } from "@/components/landing/reveal";
import { TopoLines } from "@/components/landing/topo";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
      <span className="h-px w-8 bg-coral" />
      {children}
    </p>
  );
}

const PLAN_ITEMS = [
  ["flight", "Flights"],
  ["hotel", "Hotels"],
  ["location_on", "Attractions"],
  ["train", "Local transport"],
  ["restaurant", "Restaurants"],
  ["approval", "Visa guidance"],
  ["calendar_month", "Your complete itinerary"],
] as const;

const STEPS = [
  {
    n: "01",
    title: "Tell Voyagoa what you have in mind",
    body: "Enter your budget, available days, departure city, or dream destination. No complicated travel forms — just talk naturally.",
    quote: "“Plan me a 7-day beach trip from Lagos under $2,000.”",
  },
  {
    n: "02",
    title: "Watch AI build your journey",
    body: "Voyagoa organizes the essential parts of your trip into one intelligent plan. Flights, stays, food, experiences, transport, visa guidance — everything works together.",
    quote: null,
  },
  {
    n: "03",
    title: "Explore. Adjust. Go.",
    body: "Don't like the hotel? Swap it. Want a slower Day 3? Regenerate the day. Found a better flight? Voyagoa recalculates your budget and adapts the rest of your journey.",
    quote: "Your trip changes. Your plan changes with it.",
  },
];

const BUDGET_LINES = [
  { label: "Flights", amount: 850 },
  { label: "Hotels", amount: 700 },
  { label: "Food", amount: 300 },
  { label: "Experiences", amount: 250 },
  { label: "Transport", amount: 150 },
  { label: "Trip buffer", amount: 250 },
];

const DAY3 = [
  ["9:00", "Breakfast near your hotel"],
  ["10:30", "Explore Sagrada Família"],
  ["13:00", "Local Catalan lunch"],
  ["15:00", "Walk through the Gothic Quarter"],
  ["18:00", "Sunset at Bunkers del Carmel"],
  ["20:30", "Dinner in El Born"],
] as const;

const FEATURES = [
  ["flight", "Smart flight recommendations", "Flight options that make sense for your dates, destination, and total trip budget."],
  ["hotel", "Hotels that fit the plan", "Stays chosen around your budget, location, travel style, and itinerary."],
  ["local_activity", "Experiences worth your time", "From iconic landmarks to hidden local experiences — things you'll actually want to do."],
  ["restaurant", "Eat like you belong there", "Restaurant and local food recommendations based on your location, preferences, and budget."],
  ["directions_subway", "Know how to get around", "Airport transfers, metro systems, trains, buses, ride-hailing — the easiest way to move."],
  ["approval", "Visa guidance without the confusion", "Requirements, documents, fees and application guidance, linked to official sources."],
  ["autorenew", "An itinerary that adapts", "Change one part of your trip and Voyagoa intelligently adjusts the plan around you."],
] as const;

const TRAVELERS = [
  ["savings", "Budget traveler?", "Voyagoa finds smarter ways to stretch your money."],
  ["diamond", "Luxury explorer?", "Build premium journeys without spending days planning them."],
  ["person", "Solo traveler?", "Experiences and itineraries designed around your pace."],
  ["favorite", "Couples?", "Create romantic journeys you'll both remember."],
  ["groups", "Group trips?", "Keep the entire adventure organized in one place."],
] as const;

const TABS_PAIN = [
  "Flights on one website",
  "Hotels on another",
  "Restaurants saved on social media",
  "Visa info buried in search results",
  "Your itinerary in a spreadsheet",
];

const DESTINATIONS = [
  "Barcelona", "Tokyo", "Cape Town", "Lisbon", "Bali", "Marrakech",
  "Mexico City", "Istanbul", "Bangkok", "Zanzibar", "Seoul", "Athens",
];

export default async function Home() {
  const user = await getCurrentUser();
  const demo = aiMode() === "demo";

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Nav />

      <main className="flex-1">
        {/* ============================== HERO ============================== */}
        <section id="composer" className="relative overflow-hidden border-b border-line">
          <div aria-hidden className="absolute inset-0 -z-10 opacity-70">
            <TopoLines />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-20"
            style={{
              background:
                "radial-gradient(1000px 500px at 85% 0%, rgba(14,124,102,0.10), transparent 60%), radial-gradient(700px 400px at 0% 30%, rgba(255,90,60,0.07), transparent 55%)",
            }}
          />

          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Copy + composer */}
            <div>
              <div className="animate-rise">
                <Eyebrow>AI travel planner</Eyebrow>
              </div>
              <h1 className="animate-rise mt-5 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl xl:text-[4.2rem]">
                Your entire trip.
                <br />
                <span className="text-coral">Planned by AI.</span>
              </h1>
              <p className="animate-rise-1 mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
                Tell Voyagoa your budget and how many days you have. We&apos;ll build
                your complete journey — from flights and hotels to food, visas, and
                unforgettable experiences.
              </p>

              <div className="animate-rise-2 mt-8 max-w-xl">
                <TripComposer authed={!!user} />
                {demo && (
                  <p className="mt-3 text-xs text-ink-faint">
                    Running in demo mode (no OPENAI_API_KEY configured) — plans are sample data.
                  </p>
                )}
              </div>

              <p className="animate-rise-2 mt-6 text-sm text-ink-faint">
                No endless tabs. No travel spreadsheets.{" "}
                <span className="text-ink-soft">Just one intelligent travel plan.</span>
              </p>
            </div>

            {/* Layered product mock */}
            <div className="relative hidden min-h-[520px] lg:block" aria-hidden>
              {/* Itinerary card */}
              <div className="absolute left-0 top-2 w-[330px] -rotate-2 rounded-2xl border border-line bg-card p-5 shadow-xl shadow-ink/10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coral-deep">
                    Day 3 · Barcelona
                  </p>
                  <Icon name="calendar_month" className="text-base text-ink-faint" />
                </div>
                <ol className="mt-4 space-y-3">
                  {DAY3.slice(0, 5).map(([time, title], i) => (
                    <li key={time} className="relative flex items-start gap-3">
                      {i < 4 && (
                        <span className="absolute left-[46px] top-5 h-4 w-px bg-line" />
                      )}
                      <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-ink-faint">
                        {time}
                      </span>
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-sea" />
                      <span className="text-[13px] leading-snug">{title}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-xs font-medium text-ink-soft">
                  <Icon name="autorenew" className="text-sm" />
                  Regenerate this day
                </div>
              </div>

              {/* Budget card */}
              <div className="animate-drift absolute right-0 top-[46%] w-[290px] rotate-[2.5deg] rounded-2xl border border-line bg-card p-5 shadow-xl shadow-ink/10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                    Trip budget
                  </p>
                  <span className="rounded-full bg-sea-soft px-2 py-0.5 text-[10px] font-medium text-sea">
                    On budget
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl font-semibold">
                  $2,250 <span className="text-sm font-normal text-ink-faint">of $2,500</span>
                </p>
                <div className="mt-3 space-y-2.5">
                  {BUDGET_LINES.slice(0, 3).map((line) => (
                    <div key={line.label}>
                      <div className="flex justify-between text-[11px] text-ink-soft">
                        <span>{line.label}</span>
                        <span className="tabular-nums">${line.amount}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-soft">
                        <div
                          className="h-full rounded-full bg-sea"
                          style={{ width: `${(line.amount / 850) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flight chip */}
              <div className="absolute bottom-6 left-6 flex -rotate-1 items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-lg shadow-ink/10">
                <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
                  <Icon name="flight" className="text-base" />
                </span>
                <div>
                  <p className="text-xs font-semibold">LOS → BCN · $850</p>
                  <p className="text-[11px] text-ink-faint">1 stop · 11h 35m · Economy</p>
                </div>
                <Icon name="check_circle" filled className="ml-1 text-lg text-sea" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================== ONE PROMPT, WHOLE TRIP ===================== */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <Reveal>
                <Eyebrow>The idea</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                  One prompt.
                  <br />
                  Your whole trip.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
                  Planning a trip shouldn&apos;t feel like a second job. Voyagoa turns a
                  simple idea into a complete, personalized journey in seconds — all
                  planned around your budget, your time, and your travel style.
                </p>
              </Reveal>
            </div>

            {/* Conversation mock */}
            <div className="space-y-4">
              <Reveal variant="right">
                <div className="ml-auto max-w-sm rounded-2xl rounded-br-md bg-ink px-5 py-4 text-paper shadow-lg shadow-ink/15">
                  <p className="text-sm leading-relaxed">
                    I have $2,500, 10 days, and I want somewhere unforgettable.
                  </p>
                </div>
              </Reveal>
              <Reveal variant="left" delay={150}>
                <div className="max-w-md rounded-2xl rounded-bl-md border border-line bg-card p-5 shadow-sm">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                    <span className="size-1.5 rounded-full bg-sea" />
                    Voyagoa is planning
                  </p>
                  <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {PLAN_ITEMS.map(([icon, label], i) => (
                      <Reveal as="li" key={label} variant="fade" delay={250 + i * 90}>
                        <span className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm">
                          <Icon name={icon} className="text-lg text-sea" />
                          {label}
                        </span>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========================= HOW IT WORKS ========================== */}
        <section id="how-it-works" className="border-y border-line bg-paper-soft/50">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                From “I want to travel” to{" "}
                <span className="text-coral">“I&apos;m ready to go.”</span>
              </h2>
            </Reveal>

            <div className="mt-14 space-y-0">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 100}>
                  <div className="grid gap-4 border-t border-line py-10 last:border-b sm:grid-cols-[80px_1fr_1fr] sm:gap-10">
                    <span className="font-display text-2xl font-semibold text-coral">
                      {step.n}
                    </span>
                    <h3 className="font-display text-xl font-semibold sm:text-2xl">
                      {step.title}
                    </h3>
                    <div>
                      <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
                        {step.body}
                      </p>
                      {step.quote && (
                        <p className="mt-3 text-sm font-medium italic text-ink">
                          {step.quote}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= BUDGET ENGINE ========================= */}
        <section id="budget" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <Reveal variant="left">
                <div className="rounded-3xl border border-line bg-card p-7 shadow-xl shadow-ink/5">
                  <div className="flex items-baseline justify-between">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                      <Icon name="account_balance_wallet" className="text-base" />
                      $2,500 total budget
                    </p>
                    <span className="rounded-full bg-sea-soft px-2.5 py-0.5 text-[11px] font-medium text-sea">
                      On budget
                    </span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {BUDGET_LINES.map((line, i) => (
                      <div key={line.label}>
                        <div className="flex justify-between text-sm">
                          <span>{line.label}</span>
                          <span className="font-medium tabular-nums">
                            ${line.amount.toLocaleString()}
                          </span>
                        </div>
                        <FillBar
                          pct={Math.round((line.amount / 850) * 100)}
                          delay={i * 120}
                          className="mt-1.5"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 border-t border-line pt-4 font-display text-2xl font-semibold">
                    <CountUp to={2250} prefix="$" />{" "}
                    <span className="text-base font-normal text-ink-faint">
                      of $2,500 estimated
                    </span>
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="order-1 lg:order-2">
              <Reveal>
                <Eyebrow>Budget engine</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                  A travel plan that actually understands your budget.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 text-base leading-relaxed text-ink-soft">
                  Voyagoa intelligently distributes your budget across your entire
                  journey. Change your hotel, add an experience, or upgrade your
                  flight — and your trip budget updates automatically.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <p className="mt-4 font-medium">No surprise math. No broken spreadsheets.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ====================== DAY-BY-DAY ITINERARY ===================== */}
        <section id="itinerary" className="border-y border-line bg-ink text-paper">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <Reveal>
                  <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/50">
                    <span className="h-px w-8 bg-coral" />
                    Itinerary
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                    Every day. <span className="text-coral">Already planned.</span>
                  </h2>
                </Reveal>
                <Reveal delay={160}>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-paper/70">
                    Voyagoa creates a realistic day-by-day itinerary based on your
                    location, travel time, budget, and interests. Want something
                    different? Regenerate a single day — the rest of your trip stays
                    exactly the same.
                  </p>
                </Reveal>
              </div>

              <Reveal variant="right">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                      Day 3 — Explore Barcelona
                    </p>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-[11px] font-medium text-paper/70">
                      <Icon name="autorenew" className="text-sm" />
                      Regenerate
                    </span>
                  </div>
                  <ol className="mt-6">
                    {DAY3.map(([time, title], i) => (
                      <Reveal as="li" key={time} delay={i * 100} variant="left">
                        <div className="relative flex gap-4 pb-5 last:pb-0">
                          {i < DAY3.length - 1 && (
                            <span aria-hidden className="absolute left-[60px] top-5 h-full w-px bg-white/15" />
                          )}
                          <span className="w-12 shrink-0 pt-0.5 text-right text-xs font-semibold tabular-nums text-paper/50">
                            {time}
                          </span>
                          <span className="z-10 mt-1.5 size-2 shrink-0 rounded-full bg-sea" />
                          <span className="text-sm">{title}</span>
                        </div>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========================= FEATURE LIST ========================== */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <Eyebrow>Inside every plan</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Everything your trip needs. In one place.
            </h2>
          </Reveal>

          <div className="mt-14 grid border-t border-line sm:grid-cols-2">
            {FEATURES.map(([icon, title, body], i) => (
              <Reveal key={title} delay={(i % 2) * 120}>
                <div className="flex h-full gap-5 border-b border-line py-8 pr-4 sm:odd:border-r sm:odd:pr-10 sm:even:pl-10">
                  <Icon name={icon} className="mt-0.5 text-2xl text-coral-deep" />
                  <div>
                    <h3 className="font-display text-lg font-semibold">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ========================== 27 TABS ============================== */}
        <section className="border-y border-line bg-paper-soft/50">
          <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <Reveal>
                  <Eyebrow>The old way</Eyebrow>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                    Stop planning trips across{" "}
                    <span className="text-coral">27 browser tabs.</span>
                  </h2>
                </Reveal>
                <Reveal delay={200}>
                  <div className="mt-8 rounded-2xl bg-ink p-6 text-paper shadow-xl shadow-ink/15">
                    <p className="font-display text-lg font-semibold">
                      Voyagoa brings the entire journey together.
                    </p>
                    <p className="mt-2 text-sm text-paper/70">
                      One trip. One intelligent workspace. One AI travel copilot.
                    </p>
                  </div>
                </Reveal>
              </div>

              <div className="space-y-3">
                {TABS_PAIN.map((pain, i) => (
                  <Reveal key={pain} delay={i * 90} variant="right">
                    <div
                      className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3"
                      style={{ transform: `rotate(${i % 2 === 0 ? -0.8 : 0.9}deg)` }}
                    >
                      <Icon name="tab" className="text-lg text-ink-faint" />
                      <span className="text-sm text-ink-soft line-through decoration-coral/70 decoration-2">
                        {pain}
                      </span>
                      <Icon name="close" className="ml-auto text-base text-ink-faint" />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================== BUILT AROUND YOU ======================= */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Reveal>
                <Eyebrow>For every traveler</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                  Built around you. Not the average tourist.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-soft">
                  However you travel, <strong className="text-ink">Voyagoa plans around you.</strong>
                </p>
              </Reveal>
            </div>

            <div className="border-t border-line">
              {TRAVELERS.map(([icon, who, how], i) => (
                <Reveal key={who} delay={i * 80}>
                  <div className="flex items-center gap-5 border-b border-line py-6">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper-soft">
                      <Icon name={icon} className="text-xl text-coral-deep" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{who}</h3>
                      <p className="mt-0.5 text-sm text-ink-soft">{how}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== DESTINATION TICKER ======================== */}
        <div className="ticker-mask overflow-hidden border-y border-line py-4" aria-hidden>
          <div className="animate-ticker flex w-max items-center gap-8 whitespace-nowrap">
            {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
              <span
                key={i}
                className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink-faint/70"
              >
                {d}
                <Icon name="flight" className="rotate-45 text-sm text-coral/60" />
              </span>
            ))}
          </div>
        </div>

        {/* ========================== FINAL CTA ============================ */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal variant="scale">
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-paper sm:px-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(700px 320px at 85% 115%, rgba(255,90,60,0.22), transparent 60%), radial-gradient(500px 260px at 5% -20%, rgba(14,124,102,0.25), transparent 60%)",
                }}
              />
              <div className="relative max-w-2xl">
                <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/50">
                  <span className="h-px w-8 bg-coral" />
                  Start now
                </p>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                  Your next trip starts with one sentence.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-paper/70">
                  You don&apos;t need to know where to stay. You don&apos;t need a perfect
                  itinerary. You don&apos;t even need to know exactly where you&apos;re
                  going. Just tell Voyagoa what you have —{" "}
                  <em className="font-display text-paper">“I have $2,500 and 10 days.”</em>{" "}
                  We&apos;ll take it from there.
                </p>
                <a
                  href="#composer"
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 text-sm font-medium text-white shadow-[0_4px_24px_rgba(255,90,60,0.45)] transition hover:bg-coral-deep"
                >
                  Plan my trip with AI
                  <Icon name="arrow_forward" className="text-base" />
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
