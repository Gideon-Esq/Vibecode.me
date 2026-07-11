# Voyagoa — AI Travel Planner

**Tell Voyagoa your budget and available days. Voyagoa plans the entire journey.**

Voyagoa turns one natural-language sentence — *"I have $2,500 and 10 days. I want to travel from Lagos to somewhere exciting in Europe."* — into a complete, budget-balanced trip: destination choice, flights, hotels, restaurants, attractions, local transport, visa guidance and an hour-by-hour itinerary.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + Tailwind CSS v4
- **Prisma 7** + Postgres (Supabase) via the `pg` driver adapter
- **OpenAI API** with tool calling + structured outputs (zod)
- Cookie-session auth (bcrypt), in-memory rate limiting and provider caching

## Getting started

```bash
npm install
cp .env.example .env        # add DATABASE_URL/DIRECT_URL (Supabase) + OPENAI_API_KEY
npx prisma migrate deploy   # applies migrations to your Postgres database
npm run dev
```

Open http://localhost:3000, create an account, and describe a trip.

**No API key?** The app runs in *demo mode* with deterministic sample plans so every flow (intake → follow-up questions → plan → edit → share) still works end-to-end. A banner marks demo mode in the UI.

## How the AI planner works

1. **Intake** — the request is parsed into structured details (`origin, budget, days, dates, travelers, interests`). Follow-up questions are asked only when essentials are missing.
2. **Planning loop** — the model calls tools before writing the plan:
   - `get_weather` — Open-Meteo forecast (live, keyless)
   - `convert_currency` — ECB reference rates via Frankfurter (live, keyless)
   - `search_flights` / `search_hotels` — live-API hooks (e.g. Amadeus); without keys they instruct the model to produce realistic **estimates**
   - `get_visa_info` — official-source guidance
3. **Structured output** — the final plan is schema-constrained (zod) and validated before it's stored.
4. **Budget engine** — a deterministic TypeScript engine recomputes the whole-trip estimate whenever the user swaps a flight/hotel or removes items; the tracker shows *"$2,250 of $2,500 estimated"* live.

**Data integrity:** every price-bearing item carries `dataSource: "live" | "ai_estimate"` and the UI badges each one. The model is instructed never to present estimates as live availability, and visa guidance always links official government resources with a verification disclaimer.

## Features

- Natural-language trip composer with smart follow-up questions
- Trip workspace with tabs: Overview · Itinerary · Flights · Hotels · Things to Do · Food · Transport · Visa · Budget
- Live budget tracker with per-category allocation vs. estimate bars
- Swap flights/hotels, remove activities/restaurants → budget recalculates instantly
- Regenerate any single itinerary day (with optional instructions) without touching the rest
- Saved trips + trip history per account
- Public read-only share links (revocable)
- Rate limiting, provider caching, loading states and graceful API fallbacks

## Environment variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Live AI planning (demo mode without it) |
| `OPENAI_MODEL` | Optional model override (default `gpt-5.4-mini`) |
| `DATABASE_URL` | Supabase pooled connection string (port 6543) |
| `DIRECT_URL` | Supabase direct connection string (port 5432, for migrations) |
| `VOYAGOA_DEMO_MODE` | Set `1` to force demo mode |
| `AMADEUS_CLIENT_ID/SECRET` | Hook for live flight data |

Secrets stay server-side; no key is ever exposed to the client.

## Deploying to Vercel

1. **Create the database** — new Supabase project → *Connect* → copy both the
   Transaction-pooler string (`DATABASE_URL`) and the direct string (`DIRECT_URL`).
   Use a dedicated project: Voyagoa's tables must not share a database with another app.
2. **Import the repo** at vercel.com/new and set **Root Directory** to `voyagoa`
   (or run `npx vercel` from this folder to deploy without GitHub).
3. **Set environment variables** in the Vercel project: `DATABASE_URL`,
   `DIRECT_URL`, `OPENAI_API_KEY`, and optionally `OPENAI_MODEL`.
4. Deploy. The `vercel-build` script runs `prisma migrate deploy` automatically,
   so the schema is created on first deploy.

Note: the in-memory rate limiter and provider cache are per-instance on
serverless — fine for an MVP; swap for Upstash Redis when traffic grows.
