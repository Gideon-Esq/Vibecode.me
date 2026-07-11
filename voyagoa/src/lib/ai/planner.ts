import "server-only";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  TripIntakeSchema,
  TripPlanSchema,
  ItineraryDaySchema,
  type TripIntake,
  type TripPlan,
  type ItineraryDay,
} from "@/lib/ai/schemas";
import { aiMode, getOpenAI, MODEL } from "@/lib/ai/client";
import {
  convertCurrency,
  getVisaInfo,
  getWeather,
  searchFlights,
  searchHotels,
} from "@/lib/providers";
import { mockIntake, mockPlan, mockRegenerateDay } from "@/lib/ai/mock";

// ---------------------------------------------------------------------------
// Tools the planner may call. Live providers answer where configured;
// otherwise they instruct the model to produce clearly-labeled estimates.
// ---------------------------------------------------------------------------

const PLANNER_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "Get a live 16-day weather forecast for a city (Open-Meteo). Call this when trip dates are within ~2 weeks so itinerary weather notes use verified data.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Barcelona'" },
          startDate: { type: "string", description: "ISO date" },
          endDate: { type: "string", description: "ISO date" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "convert_currency",
      description:
        "Convert an amount between currencies using live ECB reference rates. Call this whenever the user's budget currency differs from the destination currency.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "ISO code, e.g. 'USD'" },
          to: { type: "string", description: "ISO code, e.g. 'EUR'" },
          amount: { type: "number" },
        },
        required: ["from", "to", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_flights",
      description:
        "Search live flight offers for a route and dates. If it reports no live source, produce typical-fare estimates labeled dataSource=ai_estimate instead — never present estimates as live prices.",
      parameters: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Origin city or IATA code" },
          destination: { type: "string" },
          departDate: { type: "string", description: "ISO date" },
          returnDate: { type: "string", description: "ISO date" },
        },
        required: ["origin", "destination"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_hotels",
      description:
        "Search live hotel availability for a city and dates. If it reports no live source, recommend real well-known hotels with price estimates labeled dataSource=ai_estimate.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string" },
          checkIn: { type: "string" },
          checkOut: { type: "string" },
          budgetPerNight: { type: "number" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_visa_info",
      description:
        "Look up visa requirements for a passport/destination pair. If it reports no live source, give best-effort guidance labeled dataSource=ai_estimate and cite official government resources.",
      parameters: {
        type: "object",
        properties: {
          passportCountry: { type: "string" },
          destinationCountry: { type: "string" },
        },
        required: ["passportCountry", "destinationCountry"],
      },
    },
  },
];

async function executeTool(name: string, rawArgs: string): Promise<string> {
  let args: Record<string, string | number | undefined> = {};
  try {
    args = JSON.parse(rawArgs || "{}");
  } catch {
    return JSON.stringify({ available: false, note: "Malformed tool arguments" });
  }
  try {
    switch (name) {
      case "get_weather":
        return JSON.stringify(
          await getWeather(String(args.city ?? ""), args.startDate as string, args.endDate as string),
        );
      case "convert_currency":
        return JSON.stringify(
          await convertCurrency(String(args.from ?? "USD"), String(args.to ?? "USD"), Number(args.amount ?? 0)),
        );
      case "search_flights":
        return JSON.stringify(
          await searchFlights(
            String(args.origin ?? ""),
            String(args.destination ?? ""),
            args.departDate as string,
            args.returnDate as string,
          ),
        );
      case "search_hotels":
        return JSON.stringify(
          await searchHotels(
            String(args.city ?? ""),
            args.checkIn as string,
            args.checkOut as string,
            args.budgetPerNight as number,
          ),
        );
      case "get_visa_info":
        return JSON.stringify(
          await getVisaInfo(String(args.passportCountry ?? ""), String(args.destinationCountry ?? "")),
        );
      default:
        return JSON.stringify({ available: false, note: `Unknown tool ${name}` });
    }
  } catch (err) {
    return JSON.stringify({
      available: false,
      note: `Tool error: ${err instanceof Error ? err.message : "unknown"}`,
    });
  }
}

// ---------------------------------------------------------------------------
// Intake: parse the natural-language request into structured trip details and
// decide whether essential info is missing.
// ---------------------------------------------------------------------------

const INTAKE_SYSTEM = `You are Voyagoa's trip-intake analyst. Parse the traveler's natural-language request into structured details.

Rules:
- Essential info: origin city, total budget, and trip length (days OR dates). Ask follow-up questions ONLY for essential info that is truly missing — never ask about things you can reasonably infer or default.
- If no dates are given but days are, leave dates null; the planner will pick sensible dates starting ~3 weeks out.
- travelers defaults to 1, currency defaults to USD (infer from symbols like £/€/₦ when present).
- Infer interests from wording (e.g. "exciting" -> nightlife, culture, food).
- Today's date is {{TODAY}}.`;

export async function parseIntake(
  request: string,
  userDefaults: { homeCity?: string | null; passportCountry?: string | null },
): Promise<TripIntake> {
  if (aiMode() === "demo") return mockIntake(request, userDefaults);

  const client = getOpenAI();
  const completion = await client.chat.completions.parse({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: INTAKE_SYSTEM.replace("{{TODAY}}", new Date().toISOString().slice(0, 10)),
      },
      {
        role: "user",
        content: `Traveler request: """${request}"""\n\nKnown profile defaults (use if the request doesn't override them): home city: ${userDefaults.homeCity ?? "unknown"}; passport: ${userDefaults.passportCountry ?? "unknown"}.`,
      },
    ],
    response_format: zodResponseFormat(TripIntakeSchema, "trip_intake"),
  });

  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed) throw new Error("Intake parsing failed");
  return parsed;
}

// ---------------------------------------------------------------------------
// Full plan generation: agentic tool loop, then schema-constrained output.
// ---------------------------------------------------------------------------

const PLANNER_SYSTEM = `You are Voyagoa, an expert AI travel copilot. Build a complete, realistic, budget-aware trip plan.

Data integrity rules (non-negotiable):
- Use the tools for weather, currency, flights, hotels and visas BEFORE writing the plan.
- Anything backed by a live tool result gets dataSource="live". Anything you estimated yourself gets dataSource="ai_estimate". Never mark an estimate as live.
- Never invent live availability. Estimates must be realistic typical prices, and bookingHint must tell the user where to verify/book.
- Visa guidance must cite official government/embassy resources and will be shown with a "verify with official sources" disclaimer.

Planning rules:
- Respect the total budget strictly: allocation categories must sum to <= totalBudget, and the recommended (first) flight and hotel choices must fit their categories.
- If the user gave a destination wish rather than a city (e.g. "somewhere exciting in Europe"), choose ONE destination that genuinely fits the budget from their origin and explain why in destinationReason.
- If no dates were given, start the trip about 3 weeks from today on the stated number of days.
- Itinerary: one entry per day, times in 24h format, geographically sensible sequencing (cluster nearby sights), respect typical opening hours, include meals and rest, and reference activity/restaurant ids via refId.
- Prices in the trip currency throughout. flights[].price is per traveler round-trip; hotel totalPrice covers the whole stay.
- Write concise, concrete descriptions — like a sharp travel editor, not a brochure.`;

export async function generateTripPlan(intake: TripIntake, request: string): Promise<TripPlan> {
  if (aiMode() === "demo") return mockPlan(intake);

  const client = getOpenAI();
  const today = new Date().toISOString().slice(0, 10);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: PLANNER_SYSTEM },
    {
      role: "user",
      content: `Today is ${today}.\n\nOriginal request: """${request}"""\n\nStructured intake:\n${JSON.stringify(intake, null, 2)}\n\nBuild the complete trip plan now. Use tools first, then return the plan.`,
    },
  ];

  let guard = 0;
  while (true) {
    if (++guard > 12) throw new Error("Planner exceeded tool-loop limit");

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: PLANNER_TOOLS,
      response_format: zodResponseFormat(TripPlanSchema, "trip_plan"),
    });

    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error("Empty planner response");

    if (msg.tool_calls?.length) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: await executeTool(tc.function.name, tc.function.arguments),
        });
      }
      continue;
    }

    if (msg.refusal) throw new Error("The planner declined this request");
    if (!msg.content) throw new Error("Planner returned no content");

    const parsed = TripPlanSchema.safeParse(JSON.parse(msg.content));
    if (!parsed.success) {
      throw new Error(`Plan failed validation: ${parsed.error.issues[0]?.message}`);
    }
    return parsed.data;
  }
}

// ---------------------------------------------------------------------------
// Regenerate a single itinerary day without touching the rest of the trip.
// ---------------------------------------------------------------------------

export async function regenerateDay(
  plan: TripPlan,
  dayNumber: number,
  instructions?: string,
): Promise<ItineraryDay> {
  const currentDay = plan.itinerary.find((d) => d.day === dayNumber);
  if (!currentDay) throw new Error(`Day ${dayNumber} not found`);

  if (aiMode() === "demo") return mockRegenerateDay(plan, currentDay, instructions);

  const client = getOpenAI();
  const context = {
    destination: `${plan.destinationCity}, ${plan.destinationCountry}`,
    currency: plan.currency,
    travelers: plan.travelers,
    dailyBudgetHint: Math.round(
      (plan.budgetAllocation.food + plan.budgetAllocation.activities + plan.budgetAllocation.localTransport) /
        Math.max(plan.days, 1),
    ),
    availableActivities: plan.activities.map(({ id, name, openingHours, estimatedCost, durationHours }) => ({ id, name, openingHours, estimatedCost, durationHours })),
    availableRestaurants: plan.restaurants.map(({ id, name, cuisine, estimatedCostPerPerson }) => ({ id, name, cuisine, estimatedCostPerPerson })),
    otherDays: plan.itinerary
      .filter((d) => d.day !== dayNumber)
      .map((d) => ({ day: d.day, title: d.title, refIds: d.entries.map((e) => e.refId).filter(Boolean) })),
    currentDay,
  };

  const completion = await client.chat.completions.parse({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You regenerate a single day of a Voyagoa trip itinerary. Keep the same day number and date, stay within the daily budget hint, avoid repeating activities already used on other days (see refIds), prefer referencing existing activity/restaurant ids via refId, respect opening hours, and follow any user instructions.",
      },
      {
        role: "user",
        content: `Trip context:\n${JSON.stringify(context, null, 2)}\n\nUser instructions for the new version of day ${dayNumber}: ${instructions?.trim() || "Make it feel fresh — different focus or order than before."}`,
      },
    ],
    response_format: zodResponseFormat(ItineraryDaySchema, "itinerary_day"),
  });

  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed) throw new Error("Day regeneration failed");
  return { ...parsed, day: currentDay.day, date: currentDay.date };
}
