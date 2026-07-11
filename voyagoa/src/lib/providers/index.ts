// ---------------------------------------------------------------------------
// Travel data providers backing the AI's tools.
//
// Contract: every provider returns { available, source, data | note }.
// - available: true  -> `data` is live, verified third-party data ("live")
// - available: false -> no live source configured/reachable; the AI must
//   produce clearly-labeled estimates instead ("ai_estimate")
//
// Weather (Open-Meteo) and currency (Frankfurter/ECB) are free and keyless,
// so they are genuinely live. Flights/hotels/visa expose env-var hooks for
// paid APIs (e.g. Amadeus) and gracefully degrade when unset.
// ---------------------------------------------------------------------------

import { cached } from "@/lib/cache";

export type ProviderResult =
  | { available: true; source: string; data: unknown }
  | { available: false; note: string };

const FETCH_TIMEOUT_MS = 8000;

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
  return res.json();
}

// --- Weather (Open-Meteo, live, keyless) -----------------------------------

export async function getWeather(
  city: string,
  startDate?: string,
  endDate?: string,
): Promise<ProviderResult> {
  try {
    return await cached(
      `weather:${city}:${startDate}:${endDate}`,
      30 * 60_000,
      async () => {
        const geo = (await getJson(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
        )) as { results?: Array<{ latitude: number; longitude: number; name: string; country: string }> };
        const place = geo.results?.[0];
        if (!place) {
          return { available: false, note: `Could not geocode city "${city}"` };
        }

        // Forecast API covers ~16 days ahead; outside that we return climate
        // unavailability so the model falls back to seasonal knowledge.
        const params = new URLSearchParams({
          latitude: String(place.latitude),
          longitude: String(place.longitude),
          daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weather_code",
          timezone: "auto",
          forecast_days: "16",
        });
        const forecast = (await getJson(
          `https://api.open-meteo.com/v1/forecast?${params}`,
        )) as { daily?: Record<string, unknown> };

        return {
          available: true,
          source: "Open-Meteo forecast (live)",
          data: {
            location: `${place.name}, ${place.country}`,
            note: "Forecast covers the next ~16 days only. For dates beyond that, rely on seasonal averages and say so.",
            daily: forecast.daily ?? null,
          },
        } satisfies ProviderResult;
      },
    );
  } catch (err) {
    return {
      available: false,
      note: `Weather service unreachable (${err instanceof Error ? err.message : "error"}). Use seasonal knowledge and label it as an estimate.`,
    };
  }
}

// --- Currency (Frankfurter / ECB, live, keyless) ----------------------------

export async function convertCurrency(
  from: string,
  to: string,
  amount: number,
): Promise<ProviderResult> {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) {
    return { available: true, source: "identity", data: { rate: 1, converted: amount } };
  }
  try {
    return await cached(`fx:${f}:${t}:${amount}`, 60 * 60_000, async () => {
      const json = (await getJson(
        `https://api.frankfurter.dev/v1/latest?base=${f}&symbols=${t}&amount=${amount}`,
      )) as { rates?: Record<string, number>; date?: string };
      const converted = json.rates?.[t];
      if (converted === undefined) {
        return { available: false, note: `Currency ${f} or ${t} not supported by ECB reference rates` };
      }
      return {
        available: true,
        source: `European Central Bank reference rates via Frankfurter, as of ${json.date} (live)`,
        data: { from: f, to: t, amount, converted },
      } satisfies ProviderResult;
    });
  } catch (err) {
    return {
      available: false,
      note: `Currency service unreachable (${err instanceof Error ? err.message : "error"}). Use approximate rates and label them as estimates.`,
    };
  }
}

// --- Flights (hook for Amadeus/Duffel; estimates otherwise) -----------------

export async function searchFlights(
  origin: string,
  destination: string,
  departDate?: string,
  returnDate?: string,
): Promise<ProviderResult> {
  void origin; void destination; void departDate; void returnDate;
  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    // Live Amadeus integration point: exchange client credentials for a token,
    // then call /v2/shopping/flight-offers. Left unimplemented until keys and
    // a billing agreement exist; do NOT fabricate a response here.
    return {
      available: false,
      note: "Amadeus keys detected but the integration is not enabled in this build. Provide realistic estimates labeled ai_estimate.",
    };
  }
  return {
    available: false,
    note: "No live flight API configured (set AMADEUS_CLIENT_ID/SECRET). Provide realistic route and price ESTIMATES based on typical fares, label every option dataSource=ai_estimate, and point the user to Google Flights/airline sites to verify.",
  };
}

// --- Hotels (hook for a hotel API; estimates otherwise) ---------------------

export async function searchHotels(
  city: string,
  checkIn?: string,
  checkOut?: string,
  budgetPerNight?: number,
): Promise<ProviderResult> {
  void city; void checkIn; void checkOut; void budgetPerNight;
  return {
    available: false,
    note: "No live hotel API configured. Recommend real, well-known hotels/areas with typical nightly price ESTIMATES, label every option dataSource=ai_estimate, and point the user to Booking.com/Google Hotels to verify availability.",
  };
}

// --- Visa (no reliable free API; official-source guidance) ------------------

export async function getVisaInfo(
  passportCountry: string,
  destinationCountry: string,
): Promise<ProviderResult> {
  void passportCountry; void destinationCountry;
  return {
    available: false,
    note: "No live visa API configured. Give best-effort guidance from general knowledge labeled dataSource=ai_estimate, list the destination's official immigration/embassy website in officialResources, and include the requirement that users verify with official government sources because rules change.",
  };
}
