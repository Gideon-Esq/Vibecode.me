import { z } from "zod";

// ---------------------------------------------------------------------------
// Every price-bearing item carries a dataSource so the UI can clearly
// distinguish live verified data from AI-generated estimates.
// ---------------------------------------------------------------------------

export const DataSource = z.enum(["live", "ai_estimate"]);

export const TripIntakeSchema = z.object({
  complete: z
    .boolean()
    .describe(
      "true only when origin, budget, and trip length (or dates) are known and a destination can be chosen",
    ),
  followUpQuestions: z
    .array(z.string())
    .describe(
      "Questions for the user, ONLY for essential missing info (origin city, budget, days/dates). Empty when complete.",
    ),
  originCity: z.string().nullable(),
  destinationCity: z
    .string()
    .nullable()
    .describe("Concrete destination city if the user named one, else null"),
  destinationPreference: z
    .string()
    .nullable()
    .describe("Free-form destination wish, e.g. 'somewhere exciting in Europe'"),
  startDate: z.string().nullable().describe("ISO date yyyy-mm-dd if known"),
  endDate: z.string().nullable(),
  days: z.number().int().nullable().describe("Trip length in days"),
  travelers: z.number().int().describe("Number of travelers, default 1"),
  totalBudget: z.number().nullable().describe("Total budget as a number"),
  currency: z.string().describe("ISO currency code, default USD"),
  passportCountry: z.string().nullable(),
  interests: z.array(z.string()).describe("Interests inferred from the request"),
  dietary: z.array(z.string()).describe("Dietary preferences if mentioned"),
  notes: z.string().nullable(),
});
export type TripIntake = z.infer<typeof TripIntakeSchema>;

export const FlightOptionSchema = z.object({
  id: z.string().describe("Stable slug id, e.g. 'fl-1'"),
  airline: z.string(),
  route: z.string().describe("e.g. 'LOS → BCN via IST'"),
  departureTime: z.string().describe("e.g. '2026-08-01 09:40'"),
  arrivalTime: z.string(),
  duration: z.string().describe("e.g. '11h 30m'"),
  stops: z.number().int(),
  stopCities: z.array(z.string()),
  price: z.number().describe("Round-trip price per traveler in trip currency"),
  cabin: z.string().describe("e.g. 'Economy'"),
  bookingHint: z
    .string()
    .describe("Where to book/verify, e.g. 'Verify on Google Flights: LOS–BCN'"),
  dataSource: DataSource,
});
export type FlightOption = z.infer<typeof FlightOptionSchema>;

export const HotelOptionSchema = z.object({
  id: z.string().describe("Stable slug id, e.g. 'ht-1'"),
  name: z.string(),
  area: z.string().describe("Neighborhood / district"),
  style: z.string().describe("e.g. 'Boutique', 'Budget', 'Aparthotel'"),
  description: z.string(),
  nightlyPrice: z.number(),
  totalPrice: z.number().describe("nightlyPrice x nights for the whole stay"),
  rating: z.number().describe("0-5, one decimal"),
  amenities: z.array(z.string()),
  proximity: z.string().describe("Distance/transit to major attractions"),
  bookingHint: z.string(),
  dataSource: DataSource,
});
export type HotelOption = z.infer<typeof HotelOptionSchema>;

export const ActivitySchema = z.object({
  id: z.string().describe("Stable slug id, e.g. 'ac-1'"),
  name: z.string(),
  category: z.string().describe("e.g. 'Landmark', 'Museum', 'Tour', 'Nature'"),
  description: z.string(),
  location: z.string(),
  estimatedCost: z.number().describe("Per person in trip currency; 0 if free"),
  openingHours: z.string(),
  durationHours: z.number(),
  dataSource: DataSource,
});
export type Activity = z.infer<typeof ActivitySchema>;

export const RestaurantSchema = z.object({
  id: z.string().describe("Stable slug id, e.g. 're-1'"),
  name: z.string(),
  cuisine: z.string(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]),
  estimatedCostPerPerson: z.number(),
  location: z.string(),
  recommendedDishes: z.array(z.string()),
  dietaryNotes: z.string().nullable(),
  dataSource: DataSource,
});
export type Restaurant = z.infer<typeof RestaurantSchema>;

export const TransportOptionSchema = z.object({
  id: z.string(),
  mode: z.string().describe("e.g. 'Airport transfer', 'Metro', 'Ride-hailing'"),
  description: z.string(),
  estimatedCost: z.string().describe("e.g. '€2.40 per ride' or '€35 flat'"),
  tips: z.string(),
  dataSource: DataSource,
});
export type TransportOption = z.infer<typeof TransportOptionSchema>;

export const VisaInfoSchema = z.object({
  requirement: z.enum([
    "visa_free",
    "visa_on_arrival",
    "evisa",
    "visa_required",
    "unknown",
  ]),
  summary: z.string(),
  processingTime: z.string(),
  estimatedFee: z.string(),
  requiredDocuments: z.array(z.string()),
  officialResources: z.array(
    z.object({ label: z.string(), url: z.string() }),
  ),
  dataSource: DataSource,
});
export type VisaInfo = z.infer<typeof VisaInfoSchema>;

export const ItineraryEntrySchema = z.object({
  time: z.string().describe("24h time, e.g. '09:00'"),
  title: z.string(),
  description: z.string(),
  category: z.enum([
    "travel",
    "hotel",
    "food",
    "activity",
    "transport",
    "rest",
    "other",
  ]),
  estimatedCost: z.number().describe("Per person; 0 if free/none"),
  refId: z
    .string()
    .nullable()
    .describe("id of a referenced activity/restaurant/flight/hotel, else null"),
});

export const ItineraryDaySchema = z.object({
  day: z.number().int().describe("1-based day number"),
  date: z.string().describe("ISO date yyyy-mm-dd"),
  title: z.string().describe("e.g. 'ARRIVAL & CITY EXPLORATION'"),
  weatherNote: z
    .string()
    .nullable()
    .describe("Forecast/seasonal note; null when nothing useful is known"),
  entries: z.array(ItineraryEntrySchema),
  dailyCostEstimate: z.number(),
});
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

export const BudgetAllocationSchema = z.object({
  flights: z.number(),
  accommodation: z.number(),
  food: z.number(),
  activities: z.number(),
  localTransport: z.number(),
  buffer: z.number().describe("Emergency / miscellaneous buffer"),
});
export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>;

export const TripPlanSchema = z.object({
  title: z.string().describe("Short trip title, e.g. 'Barcelona in 10 Days'"),
  destinationCity: z.string(),
  destinationCountry: z.string(),
  destinationReason: z
    .string()
    .describe("Why this destination fits the user's request and budget"),
  summary: z.string().describe("2-3 sentence overview of the whole plan"),
  currency: z.string(),
  startDate: z.string().describe("ISO date"),
  endDate: z.string().describe("ISO date"),
  days: z.number().int(),
  travelers: z.number().int(),
  totalBudget: z.number(),
  budgetAllocation: BudgetAllocationSchema,
  flights: z.array(FlightOptionSchema).describe("2-4 options, cheapest first"),
  hotels: z.array(HotelOptionSchema).describe("3-5 options across price points"),
  activities: z.array(ActivitySchema).describe("8-14 options"),
  restaurants: z.array(RestaurantSchema).describe("6-10 options"),
  localTransport: z.array(TransportOptionSchema),
  visa: VisaInfoSchema,
  itinerary: z.array(ItineraryDaySchema).describe("One entry per trip day"),
  tips: z.array(z.string()).describe("3-6 practical destination tips"),
});
export type TripPlan = z.infer<typeof TripPlanSchema>;

export type TripSelections = {
  flightId: string | null;
  hotelId: string | null;
  removedActivityIds: string[];
  removedRestaurantIds: string[];
};

export const defaultSelections = (plan: TripPlan): TripSelections => ({
  flightId: plan.flights[0]?.id ?? null,
  hotelId: plan.hotels[0]?.id ?? null,
  removedActivityIds: [],
  removedRestaurantIds: [],
});
