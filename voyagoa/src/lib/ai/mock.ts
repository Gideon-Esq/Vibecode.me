// ---------------------------------------------------------------------------
// Demo mode: deterministic sample plans used when no OPENAI_API_KEY is
// configured (or VOYAGOA_DEMO_MODE=1). Everything here is labeled
// dataSource="ai_estimate" and the UI shows a demo-mode banner.
// ---------------------------------------------------------------------------

import type {
  TripIntake,
  TripPlan,
  ItineraryDay,
} from "@/lib/ai/schemas";

export function mockIntake(
  request: string,
  userDefaults: { homeCity?: string | null; passportCountry?: string | null },
): TripIntake {
  const text = request.toLowerCase();

  const budgetMatch = request.match(/[$€£]\s?([\d,]+(?:\.\d+)?)|(?:([\d,]+(?:\.\d+)?)\s?(?:usd|eur|gbp|dollars|euros|pounds|bucks))/i);
  const rawBudget = budgetMatch ? (budgetMatch[1] ?? budgetMatch[2]) : null;
  const totalBudget = rawBudget ? parseFloat(rawBudget.replace(/,/g, "")) : null;

  const daysMatch = text.match(/(\d+)\s*(?:days?|nights?)/);
  const weeksMatch = text.match(/(\d+)\s*weeks?/);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : weeksMatch ? parseInt(weeksMatch[1], 10) * 7 : null;

  const fromMatch = request.match(/from\s+([A-Z][A-Za-zÀ-ÿ .'-]+?)(?:\s+to\s|\s*[,.!]|$)/);
  const originCity = fromMatch ? fromMatch[1].trim() : (userDefaults.homeCity ?? null);

  const toMatch = request.match(/to\s+([A-Z][A-Za-zÀ-ÿ .'-]+?)(?:\s*[,.!]|$)/);
  const named = toMatch ? toMatch[1].trim() : null;
  const isVague = !named || /somewhere|anywhere|europe|asia|exciting|surprise/i.test(named);

  const travelersMatch = text.match(/(\d+)\s*(?:people|travelers|adults|of us)/);
  const currency = request.includes("€") ? "EUR" : request.includes("£") ? "GBP" : "USD";

  const missing: string[] = [];
  if (!originCity) missing.push("Which city will you be traveling from?");
  if (!totalBudget) missing.push("What's your total budget for the trip?");
  if (!days) missing.push("How many days do you have for this trip?");

  return {
    complete: missing.length === 0,
    followUpQuestions: missing,
    originCity,
    destinationCity: isVague ? null : named,
    destinationPreference: isVague ? (named ?? "somewhere exciting") : null,
    startDate: null,
    endDate: null,
    days,
    travelers: travelersMatch ? parseInt(travelersMatch[1], 10) : 1,
    totalBudget,
    currency,
    passportCountry: userDefaults.passportCountry ?? null,
    interests: /excit/i.test(text) ? ["culture", "food", "nightlife"] : ["culture", "food"],
    dietary: /vegetarian/i.test(text) ? ["vegetarian"] : [],
    notes: null,
  };
}

function isoDaysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function mockPlan(intake: TripIntake): TripPlan {
  const days = intake.days ?? 7;
  const travelers = intake.travelers || 1;
  const budget = intake.totalBudget ?? 2500;
  const currency = intake.currency || "USD";
  const origin = intake.originCity ?? "Lagos";
  const city = intake.destinationCity ?? "Barcelona";
  const country = intake.destinationCity ? "" : "Spain";
  const startDate = intake.startDate ?? isoDaysFromNow(21);
  const endDate = intake.endDate ?? isoDaysFromNow(21 + days - 1);

  const alloc = {
    flights: Math.round(budget * 0.34),
    accommodation: Math.round(budget * 0.28),
    food: Math.round(budget * 0.12),
    activities: Math.round(budget * 0.1),
    localTransport: Math.round(budget * 0.06),
    buffer: Math.round(budget * 0.1),
  };
  // Priced slightly under the allocation so the recommended combo lands within budget
  const nightly = Math.max(30, Math.round((alloc.accommodation * 0.88) / Math.max(days - 1, 1)));
  const flightBase = Math.round(alloc.flights / travelers);

  const flights = [
    {
      id: "fl-1", airline: "Turkish Airlines", route: `${origin} → ${city} via Istanbul`,
      departureTime: `${startDate} 09:40`, arrivalTime: `${startDate} 21:15`, duration: "11h 35m",
      stops: 1, stopCities: ["Istanbul"], price: flightBase, cabin: "Economy",
      bookingHint: "Verify current fares on Google Flights or turkishairlines.com", dataSource: "ai_estimate" as const,
    },
    {
      id: "fl-2", airline: "Lufthansa", route: `${origin} → ${city} via Frankfurt`,
      departureTime: `${startDate} 11:20`, arrivalTime: `${startDate} 22:05`, duration: "10h 45m",
      stops: 1, stopCities: ["Frankfurt"], price: Math.round(flightBase * 1.12), cabin: "Economy",
      bookingHint: "Verify current fares on Google Flights or lufthansa.com", dataSource: "ai_estimate" as const,
    },
    {
      id: "fl-3", airline: "Air France", route: `${origin} → ${city} via Paris CDG`,
      departureTime: `${startDate} 23:55`, arrivalTime: `${isoDaysFromNow(22)} 10:30`, duration: "10h 35m",
      stops: 1, stopCities: ["Paris"], price: Math.round(flightBase * 1.2), cabin: "Economy",
      bookingHint: "Verify current fares on Google Flights or airfrance.com", dataSource: "ai_estimate" as const,
    },
  ];

  const hotels = [
    {
      id: "ht-1", name: "Hotel Jazz", area: "Eixample / Plaça Catalunya", style: "Modern midscale",
      description: "Rooftop pool, steps from Plaça de Catalunya and the Gothic Quarter.",
      nightlyPrice: nightly, totalPrice: nightly * (days - 1), rating: 4.3,
      amenities: ["Rooftop pool", "Wi-Fi", "Breakfast", "Air conditioning"],
      proximity: "5 min walk to Las Ramblas, metro at the door",
      bookingHint: "Check availability on Booking.com or the hotel site", dataSource: "ai_estimate" as const,
    },
    {
      id: "ht-2", name: "Generator Barcelona", area: "Gràcia", style: "Design hostel / budget",
      description: "Stylish budget option with private rooms near Passeig de Gràcia.",
      nightlyPrice: Math.round(nightly * 0.6), totalPrice: Math.round(nightly * 0.6) * (days - 1), rating: 4.0,
      amenities: ["Bar", "Wi-Fi", "24h reception"],
      proximity: "10 min walk to Casa Milà", bookingHint: "Check availability on Booking.com",
      dataSource: "ai_estimate" as const,
    },
    {
      id: "ht-3", name: "H10 Madison", area: "Gothic Quarter", style: "Upscale boutique",
      description: "Elegant rooms facing the Cathedral; rooftop plunge pool with old-town views.",
      nightlyPrice: Math.round(nightly * 1.5), totalPrice: Math.round(nightly * 1.5) * (days - 1), rating: 4.6,
      amenities: ["Rooftop pool", "Restaurant", "Wi-Fi"],
      proximity: "In the heart of the old town", bookingHint: "Check availability on Booking.com",
      dataSource: "ai_estimate" as const,
    },
  ];

  const activities = [
    { id: "ac-1", name: "Sagrada Família", category: "Landmark", description: "Gaudí's unfinished basilica — book a timed-entry ticket with tower access.", location: "Eixample", estimatedCost: 33, openingHours: "09:00–20:00", durationHours: 2, dataSource: "ai_estimate" as const },
    { id: "ac-2", name: "Park Güell", category: "Landmark", description: "Mosaic terraces and city views; the monumental zone needs a timed ticket.", location: "Gràcia", estimatedCost: 13, openingHours: "09:30–19:30", durationHours: 2, dataSource: "ai_estimate" as const },
    { id: "ac-3", name: "Gothic Quarter walking tour", category: "Tour", description: "Roman walls, hidden plazas and the Cathedral with a local guide.", location: "Ciutat Vella", estimatedCost: 20, openingHours: "10:00 & 16:00 departures", durationHours: 2.5, dataSource: "ai_estimate" as const },
    { id: "ac-4", name: "La Boqueria market", category: "Food", description: "Legendary market hall — go hungry, graze the stalls.", location: "Las Ramblas", estimatedCost: 15, openingHours: "08:00–20:30, closed Sun", durationHours: 1.5, dataSource: "ai_estimate" as const },
    { id: "ac-5", name: "Casa Batlló", category: "Museum", description: "Gaudí's dragon-scaled townhouse; the audio-guide is genuinely good.", location: "Passeig de Gràcia", estimatedCost: 29, openingHours: "09:00–20:00", durationHours: 1.5, dataSource: "ai_estimate" as const },
    { id: "ac-6", name: "Barceloneta beach afternoon", category: "Nature", description: "City beach with a long boardwalk; rent a bike and ride the seafront.", location: "Barceloneta", estimatedCost: 0, openingHours: "Always open", durationHours: 3, dataSource: "ai_estimate" as const },
    { id: "ac-7", name: "Picasso Museum", category: "Museum", description: "The formative years — strongest early-work collection anywhere.", location: "El Born", estimatedCost: 15, openingHours: "10:00–19:00, closed Mon", durationHours: 2, dataSource: "ai_estimate" as const },
    { id: "ac-8", name: "Montjuïc cable car & castle", category: "Nature", description: "Ride up for harbor views, walk down through the gardens.", location: "Montjuïc", estimatedCost: 18, openingHours: "10:00–19:00", durationHours: 3, dataSource: "ai_estimate" as const },
    { id: "ac-9", name: "Flamenco show at Tablao Cordobés", category: "Nightlife", description: "Intimate tablao on Las Ramblas — book the show-only ticket.", location: "Las Ramblas", estimatedCost: 50, openingHours: "Evening shows from 19:00", durationHours: 1.5, dataSource: "ai_estimate" as const },
    { id: "ac-10", name: "Camp Nou / Barça Immersive Tour", category: "Tour", description: "Museum and stadium tour — a pilgrimage if you follow football.", location: "Les Corts", estimatedCost: 28, openingHours: "09:30–18:00", durationHours: 2, dataSource: "ai_estimate" as const },
  ];

  const restaurants = [
    { id: "re-1", name: "Cervecería Catalana", cuisine: "Tapas", priceRange: "$$" as const, estimatedCostPerPerson: 25, location: "Eixample", recommendedDishes: ["Jamón croquettes", "Solomillo skewers"], dietaryNotes: "Vegetarian tapas available", dataSource: "ai_estimate" as const },
    { id: "re-2", name: "El Xampanyet", cuisine: "Tapas & cava", priceRange: "$$" as const, estimatedCostPerPerson: 22, location: "El Born", recommendedDishes: ["Anchovies", "House cava"], dietaryNotes: null, dataSource: "ai_estimate" as const },
    { id: "re-3", name: "Bar Cañete", cuisine: "Catalan", priceRange: "$$$" as const, estimatedCostPerPerson: 45, location: "El Raval", recommendedDishes: ["Gambas al ajillo", "Oxtail brioche"], dietaryNotes: null, dataSource: "ai_estimate" as const },
    { id: "re-4", name: "La Paradeta", cuisine: "Seafood", priceRange: "$$" as const, estimatedCostPerPerson: 28, location: "El Born", recommendedDishes: ["Grilled razor clams", "Fried calamari"], dietaryNotes: "Market-style, point and pick", dataSource: "ai_estimate" as const },
    { id: "re-5", name: "Flax & Kale", cuisine: "Healthy / flexitarian", priceRange: "$$" as const, estimatedCostPerPerson: 24, location: "El Raval", recommendedDishes: ["Kale caesar", "Beet tartare"], dietaryNotes: "Strong vegetarian & vegan menu", dataSource: "ai_estimate" as const },
    { id: "re-6", name: "Bo de B", cuisine: "Sandwiches", priceRange: "$" as const, estimatedCostPerPerson: 8, location: "Gothic Quarter", recommendedDishes: ["Chicken bocadillo"], dietaryNotes: "Cheap, huge portions — expect a queue", dataSource: "ai_estimate" as const },
  ];

  const localTransport = [
    { id: "tr-1", mode: "Airport transfer", description: "Aerobús runs every 10 min from both terminals to Plaça Catalunya (~35 min).", estimatedCost: "€7.25 one-way / €12.50 return", tips: "Buy at the stop or online; taxis run €35–40.", dataSource: "ai_estimate" as const },
    { id: "tr-2", mode: "Metro & bus", description: "TMB metro covers everything you'll visit; trains every 2–5 min.", estimatedCost: "T-casual (10 rides) €12.55", tips: "One T-casual per person; it also covers the bus.", dataSource: "ai_estimate" as const },
    { id: "tr-3", mode: "Walking", description: "The old town, Born and the seafront are best on foot.", estimatedCost: "Free", tips: "Watch for pickpockets on Las Ramblas and the metro.", dataSource: "ai_estimate" as const },
    { id: "tr-4", mode: "Ride-hailing", description: "Free Now and Cabify operate citywide; Uber availability varies.", estimatedCost: "€8–15 typical ride", tips: "Late-night rides back from nightlife areas are easiest by app.", dataSource: "ai_estimate" as const },
  ];

  const dayTemplates: Array<{ title: string; refs: string[] }> = [
    { title: "ARRIVAL & CITY EXPLORATION", refs: ["ac-4", "re-1"] },
    { title: "GAUDÍ ICONS", refs: ["ac-1", "ac-2", "re-2"] },
    { title: "OLD TOWN & EL BORN", refs: ["ac-3", "ac-7", "re-4"] },
    { title: "MODERNISME & SHOPPING", refs: ["ac-5", "re-3"] },
    { title: "BEACH & SEAFRONT", refs: ["ac-6", "re-5"] },
    { title: "MONTJUÏC & FLAMENCO", refs: ["ac-8", "ac-9", "re-6"] },
    { title: "FOOTBALL & FAREWELL", refs: ["ac-10", "re-1"] },
  ];

  const itinerary: ItineraryDay[] = Array.from({ length: days }, (_, i) => {
    const t = dayTemplates[i % dayTemplates.length];
    const date = isoDaysFromNow(21 + i);
    const isFirst = i === 0;
    const isLast = i === days - 1;
    const entries = [
      ...(isFirst
        ? [
            { time: "09:40", title: "Depart " + origin, description: "Flight to " + city + " (see Flights tab).", category: "travel" as const, estimatedCost: 0, refId: "fl-1" },
            { time: "21:15", title: "Arrive & hotel check-in", description: "Aerobús to Plaça Catalunya, check in and drop bags.", category: "hotel" as const, estimatedCost: 8, refId: "ht-1" },
          ]
        : [
            { time: "09:00", title: "Breakfast near the hotel", description: "Coffee and a pastry — most cafés open by 08:30.", category: "food" as const, estimatedCost: 6, refId: null },
          ]),
      ...(!isFirst
        ? t.refs.map((refId, idx) => {
            const act = activities.find((a) => a.id === refId);
            const rest = restaurants.find((r) => r.id === refId);
            const time = ["10:00", "13:30", "16:00", "20:00"][idx] ?? "18:00";
            return act
              ? { time, title: act.name, description: act.description, category: "activity" as const, estimatedCost: act.estimatedCost, refId }
              : { time: idx === 1 ? "13:30" : "20:30", title: `Dinner at ${rest!.name}`, description: rest!.recommendedDishes.join(", "), category: "food" as const, estimatedCost: rest!.estimatedCostPerPerson, refId };
          })
        : []),
      ...(isLast
        ? [{ time: "17:00", title: "Head to the airport", description: "Allow 3h before departure; Aerobús from Plaça Catalunya.", category: "travel" as const, estimatedCost: 8, refId: null }]
        : [{ time: "22:30", title: "Wind down", description: "Evening stroll or a nightcap near the hotel.", category: "rest" as const, estimatedCost: 0, refId: null }]),
    ];
    return {
      day: i + 1,
      date,
      title: isFirst ? "ARRIVAL & CITY EXPLORATION" : isLast ? "LAST MORNING & DEPARTURE" : t.title,
      weatherNote: null,
      entries,
      dailyCostEstimate: entries.reduce((s, e) => s + e.estimatedCost, 0),
    };
  });

  return {
    title: `${city} in ${days} Days`,
    destinationCity: city,
    destinationCountry: country || "Spain",
    destinationReason: `${city} packs world-class architecture, beaches, food and nightlife into one walkable city, and typical ${currency} ${budget.toLocaleString()} budgets from ${origin} cover flights, a central hotel and daily activities comfortably.`,
    summary: `${days} days in ${city} balancing Gaudí landmarks, the old town, beach time and standout food, with a realistic ${currency} ${budget.toLocaleString()} budget for ${travelers} traveler${travelers > 1 ? "s" : ""}.`,
    currency,
    startDate,
    endDate,
    days,
    travelers,
    totalBudget: budget,
    budgetAllocation: alloc,
    flights,
    hotels,
    activities,
    restaurants,
    localTransport,
    visa: {
      requirement: "visa_required",
      summary: `Travelers on many passports need a Schengen short-stay visa for Spain. Check the requirement for your specific passport — some nationalities are visa-exempt for stays up to 90 days.`,
      processingTime: "Typically 15 calendar days; apply up to 6 months ahead",
      estimatedFee: "€90 (adult short-stay Schengen visa)",
      requiredDocuments: [
        "Passport valid 3+ months beyond departure",
        "Completed Schengen application form",
        "Flight reservation and hotel bookings",
        "Travel insurance (min €30,000 coverage)",
        "Proof of funds and employment/ties",
      ],
      officialResources: [
        { label: "Spain Ministry of Foreign Affairs — visas", url: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Visados.aspx" },
        { label: "EU Schengen visa info", url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en" },
      ],
      dataSource: "ai_estimate",
    },
    itinerary,
    tips: [
      "Book Sagrada Família and Park Güell tickets online at least a week ahead.",
      "Lunch menús del día (fixed-price, ~€14) are the best-value meals in the city.",
      "Keep phones and wallets zipped — pickpocketing is the main tourist risk.",
      "Dinner starts late; most kitchens don't fill up until 21:00.",
    ],
  };
}

export function mockRegenerateDay(
  plan: TripPlan,
  currentDay: ItineraryDay,
  instructions?: string,
): ItineraryDay {
  // Swap in activities not used on this day to make regeneration visible.
  const usedIds = new Set(currentDay.entries.map((e) => e.refId).filter(Boolean));
  const fresh = plan.activities.filter((a) => !usedIds.has(a.id)).slice(0, 2);
  const rest = plan.restaurants[(currentDay.day + 1) % plan.restaurants.length];

  const entries = [
    { time: "09:00", title: "Slow breakfast", description: "Start the day easy near the hotel.", category: "food" as const, estimatedCost: 6, refId: null },
    ...fresh.map((a, i) => ({
      time: i === 0 ? "10:30" : "15:00",
      title: a.name,
      description: a.description,
      category: "activity" as const,
      estimatedCost: a.estimatedCost,
      refId: a.id,
    })),
    { time: "20:30", title: `Dinner at ${rest.name}`, description: rest.recommendedDishes.join(", "), category: "food" as const, estimatedCost: rest.estimatedCostPerPerson, refId: rest.id },
  ];

  return {
    ...currentDay,
    title: instructions?.trim() ? currentDay.title : "A DIFFERENT ANGLE",
    entries,
    dailyCostEstimate: entries.reduce((s, e) => s + e.estimatedCost, 0),
  };
}
