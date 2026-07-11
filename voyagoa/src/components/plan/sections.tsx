import type {
  FlightOption,
  HotelOption,
  Activity,
  Restaurant,
  TransportOption,
  VisaInfo,
  ItineraryDay,
} from "@/lib/ai/schemas";
import type { BudgetBreakdown } from "@/lib/budget";
import { formatMoney } from "@/lib/budget";
import { Badge, Card, SourceBadge, cn } from "@/components/ui";
import { Icon } from "@/components/icon";

// ---------------------------------------------------------------------------
// Budget tracker
// ---------------------------------------------------------------------------

export function BudgetTracker({ budget }: { budget: BudgetBreakdown }) {
  const pct = Math.min(100, Math.round((budget.estimatedTotal / budget.totalBudget) * 100));
  return (
    <Card className="sticky top-20">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
          Budget tracker
        </h3>
        <Badge tone={budget.withinBudget ? "sea" : "coral"}>
          {budget.withinBudget ? "On budget" : "Over budget"}
        </Badge>
      </div>

      <p className="mt-3 font-display text-2xl font-semibold">
        {formatMoney(budget.estimatedTotal, budget.currency)}
        <span className="text-base font-normal text-ink-faint">
          {" "}of {formatMoney(budget.totalBudget, budget.currency)} estimated
        </span>
      </p>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-soft">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            budget.withinBudget ? "bg-sea" : "bg-coral",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {budget.lines.map((line) => (
          <li key={line.key} className="flex items-center justify-between">
            <span className="text-ink-soft">{line.label}</span>
            <span
              className={cn(
                "font-medium tabular-nums",
                line.estimated > line.allocated && "text-coral-deep",
              )}
            >
              {formatMoney(line.estimated, budget.currency)}
              <span className="ml-1 text-xs font-normal text-ink-faint">
                / {formatMoney(line.allocated, budget.currency)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p
        className={cn(
          "mt-4 rounded-lg px-3 py-2 text-xs",
          budget.withinBudget ? "bg-sea-soft text-sea" : "bg-coral/10 text-coral-deep",
        )}
      >
        {budget.withinBudget
          ? `${formatMoney(budget.remaining, budget.currency)} of headroom left.`
          : `${formatMoney(-budget.remaining, budget.currency)} over — try a cheaper flight or hotel.`}
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Flights
// ---------------------------------------------------------------------------

export function FlightCard({
  flight,
  currency,
  selected,
  onSelect,
}: {
  flight: FlightOption;
  currency: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card
      className={cn(
        "transition",
        selected && "border-sea ring-2 ring-sea/20",
        onSelect && "cursor-pointer hover:border-ink-faint",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={!onSelect}
        className="w-full text-left disabled:cursor-default"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{flight.airline}</p>
            <p className="text-sm text-ink-soft">{flight.route}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-semibold">
              {formatMoney(flight.price, currency)}
            </p>
            <p className="text-xs text-ink-faint">per traveler, round-trip</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-1"><Icon name="flight_takeoff" className="text-sm" /> {flight.departureTime}</span>
          <span className="flex items-center gap-1"><Icon name="flight_land" className="text-sm" /> {flight.arrivalTime}</span>
          <span className="flex items-center gap-1"><Icon name="schedule" className="text-sm" /> {flight.duration}</span>
          <span>
            {flight.stops === 0
              ? "Nonstop"
              : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopCities.length ? ` (${flight.stopCities.join(", ")})` : ""}`}
          </span>
          <span>{flight.cabin}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-faint">{flight.bookingHint}</p>
          <div className="flex items-center gap-2">
            <SourceBadge source={flight.dataSource} />
            {selected && <Badge tone="sea">Selected</Badge>}
          </div>
        </div>
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Hotels
// ---------------------------------------------------------------------------

export function HotelCard({
  hotel,
  currency,
  selected,
  onSelect,
}: {
  hotel: HotelOption;
  currency: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card
      className={cn(
        "transition",
        selected && "border-sea ring-2 ring-sea/20",
        onSelect && "cursor-pointer hover:border-ink-faint",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={!onSelect}
        className="w-full text-left disabled:cursor-default"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{hotel.name}</p>
            <p className="text-sm text-ink-soft">
              {hotel.area} · {hotel.style} · <Icon name="star" filled className="text-sm text-coral-deep align-[-2px]" /> {hotel.rating.toFixed(1)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-semibold">
              {formatMoney(hotel.nightlyPrice, currency)}
              <span className="text-sm font-normal text-ink-faint">/night</span>
            </p>
            <p className="text-xs text-ink-faint">
              {formatMoney(hotel.totalPrice, currency)} total stay
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{hotel.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hotel.amenities.map((a) => (
            <Badge key={a}>{a}</Badge>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-faint">
            <Icon name="location_on" className="text-sm align-[-2px]" /> {hotel.proximity} · {hotel.bookingHint}
          </p>
          <div className="flex items-center gap-2">
            <SourceBadge source={hotel.dataSource} />
            {selected && <Badge tone="sea">Selected</Badge>}
          </div>
        </div>
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Activities & restaurants
// ---------------------------------------------------------------------------

export function ActivityCard({
  activity,
  currency,
  removed,
  onToggle,
}: {
  activity: Activity;
  currency: string;
  removed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Card className={cn("transition", removed && "opacity-50")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{activity.name}</p>
            <Badge>{activity.category}</Badge>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{activity.description}</p>
          <p className="mt-2 text-xs text-ink-faint">
            <Icon name="location_on" className="text-sm align-[-2px]" /> {activity.location} · <Icon name="schedule" className="text-sm align-[-2px]" /> {activity.openingHours} · ~{activity.durationHours}h
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-semibold">
            {activity.estimatedCost === 0 ? "Free" : formatMoney(activity.estimatedCost, currency)}
          </p>
          <div className="mt-1">
            <SourceBadge source={activity.dataSource} />
          </div>
        </div>
      </div>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 cursor-pointer text-xs font-medium text-coral-deep hover:underline"
        >
          {removed ? "Add back to trip" : "Remove from trip"}
        </button>
      )}
    </Card>
  );
}

export function RestaurantCard({
  restaurant,
  currency,
  removed,
  onToggle,
}: {
  restaurant: Restaurant;
  currency: string;
  removed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Card className={cn("transition", removed && "opacity-50")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{restaurant.name}</p>
            <Badge>{restaurant.cuisine}</Badge>
            <Badge tone="sand">{restaurant.priceRange}</Badge>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">
            Try: {restaurant.recommendedDishes.join(", ")}
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            <Icon name="location_on" className="text-sm align-[-2px]" /> {restaurant.location}
            {restaurant.dietaryNotes ? ` · ${restaurant.dietaryNotes}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-semibold">
            {formatMoney(restaurant.estimatedCostPerPerson, currency)}
          </p>
          <p className="text-xs text-ink-faint">per person</p>
          <div className="mt-1">
            <SourceBadge source={restaurant.dataSource} />
          </div>
        </div>
      </div>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 cursor-pointer text-xs font-medium text-coral-deep hover:underline"
        >
          {removed ? "Add back to trip" : "Remove from trip"}
        </button>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Transport & visa
// ---------------------------------------------------------------------------

export function TransportCard({ option }: { option: TransportOption }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{option.mode}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{option.description}</p>
          <p className="mt-2 text-xs text-ink-faint"><Icon name="lightbulb" className="text-sm align-[-2px]" /> {option.tips}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold">{option.estimatedCost}</p>
          <div className="mt-1">
            <SourceBadge source={option.dataSource} />
          </div>
        </div>
      </div>
    </Card>
  );
}

const VISA_LABELS: Record<VisaInfo["requirement"], { label: string; tone: "sea" | "coral" | "sand" | "neutral" }> = {
  visa_free: { label: "Visa-free", tone: "sea" },
  visa_on_arrival: { label: "Visa on arrival", tone: "sea" },
  evisa: { label: "eVisa", tone: "sand" },
  visa_required: { label: "Visa required", tone: "coral" },
  unknown: { label: "Check requirements", tone: "neutral" },
};

export function VisaPanel({ visa }: { visa: VisaInfo }) {
  const meta = VISA_LABELS[visa.requirement];
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={meta.tone} className="px-3 py-1 text-xs">
            {meta.label}
          </Badge>
          <SourceBadge source={visa.dataSource} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{visa.summary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Processing time
            </p>
            <p className="mt-1 text-sm">{visa.processingTime}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Expected fee
            </p>
            <p className="mt-1 text-sm">{visa.estimatedFee}</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Required documents
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-soft">
          {visa.requiredDocuments.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {visa.officialResources.length > 0 && (
          <>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Official resources
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {visa.officialResources.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sea underline underline-offset-2 hover:text-ink"
                  >
                    {r.label} <Icon name="open_in_new" className="text-xs align-[-1px]" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <p className="rounded-xl border border-coral/30 bg-coral/5 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <Icon name="warning" className="mr-1 text-sm align-[-2px] text-coral-deep" />Visa requirements change frequently and vary by individual circumstances. This
        guidance is informational only — always verify through official government or embassy
        sources before booking travel.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Itinerary
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, string> = {
  travel: "flight",
  hotel: "hotel",
  food: "restaurant",
  activity: "local_activity",
  transport: "directions_subway",
  rest: "bedtime",
  other: "location_on",
};

export function ItineraryDayView({
  day,
  currency,
  onRegenerate,
  regenerating,
}: {
  day: ItineraryDay;
  currency: string;
  onRegenerate?: (instructions?: string) => void;
  regenerating?: boolean;
}) {
  return (
    <Card className={cn(regenerating && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-coral-deep">
            Day {day.day} · {day.date}
          </p>
          <h3 className="font-display text-lg font-semibold tracking-tight">{day.title}</h3>
          {day.weatherNote && (
            <p className="mt-1 text-xs text-ink-faint"><Icon name="partly_cloudy_day" className="text-sm align-[-2px]" /> {day.weatherNote}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="sand">
            ~{formatMoney(day.dailyCostEstimate, currency)}/person
          </Badge>
          {onRegenerate && (
            <button
              type="button"
              disabled={regenerating}
              onClick={() => onRegenerate()}
              className="cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-coral hover:text-coral-deep disabled:cursor-wait"
              title="Regenerate this day only"
            >
              {regenerating ? "Regenerating…" : "Regenerate day"}
            </button>
          )}
        </div>
      </div>

      <ol className="mt-4 space-y-0">
        {day.entries.map((entry, i) => (
          <li key={i} className="relative flex gap-4 pb-4 last:pb-0">
            {i < day.entries.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[52px] top-7 h-full w-px bg-line"
              />
            )}
            <span className="w-10 shrink-0 pt-0.5 text-right text-sm font-semibold tabular-nums text-ink-soft">
              {entry.time}
            </span>
            <span className="z-10 grid size-6 shrink-0 place-items-center rounded-full bg-paper-soft">
              <Icon name={CATEGORY_ICONS[entry.category] ?? "location_on"} className="text-sm text-ink-soft" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {entry.title}
                {entry.estimatedCost > 0 && (
                  <span className="ml-2 text-xs font-normal text-ink-faint">
                    ~{formatMoney(entry.estimatedCost, currency)}
                  </span>
                )}
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
