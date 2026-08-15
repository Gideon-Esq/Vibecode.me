# Database & Accounts

Cineast stores your library in **your own Neon Postgres database**. TMDB is
optional: connect it and your watchlist and favorites are mirrored there too.

---

## 1. What lives where

| Data | Owner | Notes |
| --- | --- | --- |
| User accounts | `neon_auth.user` | Managed by Neon Auth. We never write to it. |
| Watched movies | `watched` | Ours alone — TMDB has no "watched" concept. |
| Watchlist | `watchlist` | Ours, mirrored to TMDB when connected. |
| Favorites | `favorites` | Ours, mirrored to TMDB when connected. |
| TMDB link | `tmdb_accounts` | Holds the encrypted TMDB session id. |
| Movie metadata | `movies` | Cache, so lists render without N TMDB calls. |

**The database is always the source of truth.** A TMDB mirror failure is logged
and reported to the UI, but never fails the request or rolls back the local write
— a TMDB outage must not take the app's core feature down with it.

---

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon console → your project → **Connection Details**. Use the **pooled** string. |
| `NEON_AUTH_BASE_URL` | Neon console → **Auth**. Looks like `https://ep-xxx.neonauth.<region>.aws.neon.tech/<db>/auth`. |
| `NEON_AUTH_COOKIE_SECRET` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` — must decode to exactly 32 bytes. |
| `TMDB_BRIDGE_SECRET` | `openssl rand -base64 32` |

Generate all three secrets at once:

```bash
for name in NEON_AUTH_COOKIE_SECRET ENCRYPTION_KEY TMDB_BRIDGE_SECRET; do
  echo "$name=$(openssl rand -base64 32)"
done
```

> **`TMDB_BRIDGE_SECRET` is permanent.** It derives the hidden credentials behind
> "Continue with TMDB" accounts. Rotating it locks those users out. `ENCRYPTION_KEY`
> is recoverable by comparison — rotating it only forces users to reconnect TMDB.

---

## 3. Enable Auth on the Neon project

In the Neon console, open your project and turn on **Auth**. This creates the
`neon_auth` schema and its `user` table. The migration below foreign-keys to that
table and will refuse to run with a clear error if Auth is not enabled yet.

### Trust your app's domain — required

Neon Auth validates the origin of every write request (sign-in, sign-up) against
an allowlist, and rejects anything else with **`Invalid origin`**. Add the URL you
actually browse the app on:

**Neon Console → Auth → Configuration → Domains**, with the protocol and no
trailing slash.

| Where you run it | Add |
| --- | --- |
| Local | `http://localhost:3000` |
| GitHub Codespaces | `https://<your-codespace>-3000.app.github.dev` |
| Preview deploys | `https://*.your-app.vercel.app` (wildcards allowed) |
| Production | `https://yourdomain.com` |

Miss this and **all** sign-in fails, not just TMDB — the email/password form
included. A Codespaces URL changes with the codespace, so re-add it if you
rebuild.

---

## 4. Apply the migration

```bash
npm install
npm run db:migrate
```

`drizzle/0000_init.sql` creates the six tables above. It deliberately does **not**
create the `neon_auth` schema — Neon owns that.

To change the schema later, edit `lib/db/schema.ts`, then:

```bash
npm run db:generate   # writes a new file to drizzle/
npm run db:migrate    # applies it
```

There is intentionally no `db:push` script. `drizzle-kit push` diffs the live
database against the schema file and would happily alter or drop columns in
`neon_auth`, which Neon manages.

---

## 5. Sign-up paths

Both paths end at the same Neon Auth session, so the rest of the app has exactly
one notion of "signed in".

**Email + password** — the ordinary Neon Auth flow, at `/signup`.

**Continue with TMDB** — Neon Auth is a *managed* Better Auth server, so we cannot
register a custom provider on it, and TMDB is not OAuth2 anyway (it uses its own
request-token approval flow). Instead:

1. TMDB verifies the person and returns their account id.
2. `lib/auth/tmdb-bridge.ts` derives a placeholder email and a 256-bit password
   from that id plus `TMDB_BRIDGE_SECRET`, and uses them to create or sign in a
   Neon Auth user.

Those credentials are derived on demand, never stored, and never shown — deriving
them requires the server secret. Placeholder addresses use `@tmdb.cineast.invalid`
(`.invalid` is reserved by RFC 2606, so it can never collide with a real inbox).

An account created this way cannot disconnect TMDB until it has real credentials —
otherwise it would lose its only way to sign in. The API returns a clear error.

---

## 6. Connecting TMDB later

Account → **Connect TMDB**. This links TMDB to the account you are already signed
in as, and from then on watchlist and favorites changes are mirrored.

Disconnecting leaves your library untouched — it never depended on TMDB. Changes
simply stop being mirrored.

### Why the flow lands on a page, not a route handler

TMDB redirects to `/auth/tmdb` (a page), which completes the flow with a
same-origin `POST /api/tmdb/complete`.

The indirection is necessary. Neon Auth derives the request origin from the
`origin`/`referer` header, so signing in *during* TMDB's redirect reports the
origin as `https://www.themoviedb.org` and Better Auth rejects it with
`Invalid origin`. Issuing the call from our own page makes the origin the app's.

### CSRF note

The in-flight request token is held in an httpOnly cookie, and
`/api/tmdb/complete` requires the token TMDB echoes back to match it. Without that
check, an attacker could get their own TMDB token approved and then lure a
signed-in victim to the callback URL, silently attaching the attacker's TMDB
account to the victim's app account.

The cookie is consumed before any other work, so a replayed request cannot reuse
it, and `/auth/tmdb` guards against React StrictMode running the exchange twice —
TMDB request tokens are single-use.

---

## 7. Where things live

```
lib/
  db/schema.ts          Drizzle table definitions
  db/index.ts           Lazy Neon connection
  library.ts            Library reads/writes + TMDB mirroring
  tmdb-server.ts        Server-side TMDB client (session ids never reach the browser)
  crypto.ts             AES-256-GCM for stored session ids; HMAC for derived credentials
  auth/server.ts        Neon Auth instance (lazy)
  auth/session.ts       getCurrentUser / requireUserId — the only auth entry point
  auth/tmdb-bridge.ts   "Continue with TMDB" → Neon Auth user
  auth/tmdb-flow.ts     The approval-flow state cookie
app/api/
  auth/[...path]        Neon Auth endpoints
  library               All library movie ids, in one request
  watched               GET list + stats · POST mark/update · DELETE
  watchlist             GET · POST · DELETE
  favorites             GET · POST · DELETE
  tmdb/start            Begins TMDB approval (mode=signin | link)
  tmdb/complete         Finishes it, called same-origin from /auth/tmdb
  tmdb/link             GET status · DELETE to disconnect
app/auth/tmdb           Landing page for TMDB's redirect
hooks/
  use-session.ts        Who is signed in
  use-library.ts        React Query hooks + optimistic toggles
```
