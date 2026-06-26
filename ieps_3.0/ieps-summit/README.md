# IEPS 3.0 — Ife Education Parliamentary Summit

Official website for the **Ife Education Parliamentary Summit 3.0**.

> **Theme:** _Nigerian Parliamentarians: A Strategic Panacea for Nation Building and Educational Reform_
> **Date:** Wednesday, 22nd July 2026 · **Venue:** African Centre of Excellence (ACE), OAU, Ile-Ife

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion** and **lucide-react**.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL + secrets
npm run dev            # http://localhost:3000
```

Other scripts:

```bash
npm run build      # prisma generate + production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Database & auth (Prisma + Neon + Auth.js v5)

1. Create a free **Neon PostgreSQL** database and copy its connection string into
   `DATABASE_URL` in `.env`.
2. Set `NEXTAUTH_SECRET` / `AUTH_SECRET` (`openssl rand -base64 32`) and the
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` seed values.
3. Push the schema and seed the admin account:

```bash
npm run db:push    # create tables from prisma/schema.prisma
npm run db:seed    # create/update the admin user (bcrypt-hashed)
npm run db:studio  # optional: browse data in Prisma Studio
```

Admin login lives at **`/admin/login`**; `middleware.ts` protects every
`/admin/*` route and redirects unauthenticated users to it.

**Models:** `User` (admins), `Registration` (attendees), `SessionInterest`
(join), `AnalyticsEvent`. See [prisma/schema.prisma](prisma/schema.prisma).

### Auth architecture note

Auth.js v5 runs middleware on the Edge runtime, which can't load Prisma/bcrypt.
So the config is split: [lib/auth.config.ts](lib/auth.config.ts) is edge-safe
(used by `middleware.ts`), and [lib/auth.ts](lib/auth.ts) adds the Credentials
provider (bcrypt + Prisma) for the Node route handler.

## Project structure

```
app/                 App Router routes (home + about/programme/gallery/register/admin)
components/
  ui/                Button, Badge, CountdownTimer, Reveal
  layout/            Navbar, Footer, PagePlaceholder
  home/              Homepage sections
lib/                 constants.ts (event content) + utils.ts (cn, countdown helpers)
styles/globals.css   Tailwind layers + design tokens
public/logos/        Brand + organiser logos (see logos/README.md)
```

## Design system

| Token | Value |
|-------|-------|
| Navy | `#0D1B5E` |
| Gold | `#F5C400` |
| Emerald | `#1A7A3C` |
| Off-white | `#F8F8F4` |
| Ink | `#1A1A2E` |

Fonts: **Space Grotesk** (display), **Inter** (body), **Barlow Condensed** (labels) — loaded via `next/font`.

Edit event copy, dates, contact and organiser details in [`lib/constants.ts`](lib/constants.ts).

## Registration system

- **Form** — [app/register/page.tsx](app/register/page.tsx): a 4-step
  (Personal → Academic → Preferences → Review) Typeform-style flow built with
  react-hook-form + Zod, framer-motion slide transitions, a progress bar and
  inline validation.
- **API** — [app/api/register/route.ts](app/api/register/route.ts): validates
  with Zod (422 on bad input), rejects duplicate emails (409), saves the
  `Registration` + `SessionInterest` rows, sends the confirmation email, logs a
  `REGISTRATION` analytics event, and returns `201 { id }`.
- **Email** — [lib/email.ts](lib/email.ts): branded HTML confirmation via
  Resend. Sending is best-effort — a mail failure never fails a registration.
  Set `RESEND_API_KEY` and (optionally) `EMAIL_FROM` to enable it.
- **Success** — [app/register/success/page.tsx](app/register/success/page.tsx):
  animated checkmark, details summary, WhatsApp share + back-home.

Shared option lists and the Zod schema live in
[lib/registration.ts](lib/registration.ts).

## Certificate system

Premium landscape-A4 **Certificate of Participation** (PDFKit), with the real
organiser logos embedded and a drawn gold seal + double border.

- [lib/certificate.ts](lib/certificate.ts) — `generateCertificate(name, id)` →
  `Buffer`. Deterministic, so it can be regenerated on demand.
- [lib/cloudinary.ts](lib/cloudinary.ts) — `uploadCertificate(buffer, filename)`
  → secure URL. Optional: if Cloudinary isn't configured, certificates are
  served from the app's own `/api/certificate/[id]` endpoint instead.
- [lib/certificate-service.ts](lib/certificate-service.ts) — `issueCertificate()`
  ties it together: generate → upload (or fallback URL) → email → persist.
- Routes (all Node runtime):
  - `POST /api/admin/generate-certificate` — admin-only, one registration.
  - `POST /api/admin/generate-all-certificates` — admin-only, every
    `attended: true` registration.
  - `GET /api/certificate/[id]` — public PDF stream for an issued certificate.
- Delivery email (PDF attached + download button) lives in
  [lib/email.ts](lib/email.ts) (`sendCertificateEmail`).

PDFKit is marked as an external server package and the logos are traced into
the certificate routes (see [next.config.mjs](next.config.mjs)) so it all works
in serverless deploys.

## Admin dashboard

Protected control panel under `/admin` (login at `/admin/login`). The
authenticated pages live in the `(panel)` route group with a shared sidebar
layout; the public Navbar/Footer are hidden across `/admin`.

- **Dashboard / Analytics** — KPI cards + 7 Recharts charts (registrations over
  time, role/gender/heard-about pies, institution/session/state bars) from
  [lib/analytics.ts](lib/analytics.ts).
- **Registrations** — TanStack table with server-side search, status/role/state
  filters, sortable columns, pagination, row actions (view, confirm, attended,
  generate certificate, email, delete) and bulk actions (CSV/Excel export, mark
  attended, generate all).
- **Attendance** — confirmed list with instant-save attended toggles + "mark all
  present".
- **Certificates** — per-attendee + bulk certificate generation (ties into the
  Prompt 4 system).
- **Settings** — branded broadcast email composer.

Admin API routes (all self-guard with `auth()` since middleware only matches
`/admin/*` pages): `registrations` (list), `registrations/[id]`
(GET/PATCH/DELETE), `analytics`, `export` (CSV / `?format=xlsx`),
`send-bulk-email`. CSV generation is in [lib/export.ts](lib/export.ts).

## Public pages

- **About** ([app/about](app/about/page.tsx)) — mission/history, the theme, 7
  animated objective cards, organising bodies, and the team grid.
- **Programme** ([app/programme](app/programme/page.tsx)) — alternating vertical
  timeline of the 7 segments + "schedule coming soon" banner and register CTA.
- **Gallery** ([app/gallery](app/gallery/page.tsx)) — IEPS 3.0 / Previous
  Editions tabs, a CSS parliament-chamber empty state, and a placeholder grid.
- **Contact** ([app/contact](app/contact/page.tsx)) — form (→ `POST /api/contact`,
  emails the organiser via Resend), details card, and an embedded map.

## Build roadmap

This is **Prompt 1 of 8**: scaffold, design system and homepage. Registration form (Prompt 3),
admin dashboard (Prompt 5) and the remaining pages are completed in later prompts. Placeholder
routes already exist so navigation never dead-ends.
