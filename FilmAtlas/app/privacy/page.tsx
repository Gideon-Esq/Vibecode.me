import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Cineast',
  description: 'What Cineast stores, why it stores it, and how to remove it.',
};

/**
 * Written to describe what the app actually does, so it stays accurate: the
 * data listed here maps to the tables in lib/db/schema.ts and the third parties
 * are the ones the code really talks to (TMDB and Neon).
 */
const LAST_UPDATED = 'August 15, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-8">
      <article className="mx-auto max-w-3xl">
        <header>
          <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-gray-400">Last updated {LAST_UPDATED}</p>
        </header>

        <div className="mt-10 space-y-10">
          <Section title="The short version">
            <p>
              Cineast stores the account you sign in with and the titles you save
              — your watched history, watchlist and favorites. That&apos;s it.
              There is no advertising, no analytics or tracking pixels, and
              nothing is sold or shared with anyone for marketing.
            </p>
          </Section>

          <Section title="What we store">
            <Definition term="Account details">
              Your email address, display name and a securely hashed password.
              Passwords are never stored in a readable form, and we never see
              them. Authentication is handled by Neon Auth.
            </Definition>
            <Definition term="Your library">
              The movies and TV series you mark as watched, add to your
              watchlist, or favorite — along with any rating, personal note,
              rewatch count and the date you recorded.
            </Definition>
            <Definition term="Title metadata">
              A cached copy of public information about titles in your library
              (name, poster, release date, runtime, genres) so your lists load
              quickly. This is public data from TMDB and is not personal to you.
            </Definition>
            <Definition term="TMDB connection">
              If you connect a TMDB account, we store its account id, username
              and a session token. That token is{' '}
              <strong className="text-white">encrypted at rest</strong> and is
              only ever decrypted on the server to carry out an action you
              triggered.
            </Definition>
          </Section>

          <Section title="What we don't do">
            <ul className="list-disc space-y-2 pl-5">
              <li>No advertising, ad networks or ad identifiers.</li>
              <li>No third-party analytics, tracking pixels or fingerprinting.</li>
              <li>No selling, renting or sharing of your data for marketing.</li>
              <li>No cookies beyond the one that keeps you signed in.</li>
            </ul>
          </Section>

          <Section title="Cookies">
            <p>
              Cineast sets one essential cookie to keep you signed in. A second,
              short-lived cookie is used only while you are connecting a TMDB
              account, and it is deleted as soon as that finishes. Both are
              strictly necessary for the app to work — there are no analytics or
              advertising cookies to opt out of.
            </p>
          </Section>

          <Section title="Who your data is shared with">
            <p>
              Only the services required to run the app:
            </p>
            <Definition term="Neon">
              Hosts the database and handles authentication. Your account and
              library live here.
            </Definition>
            <Definition term="TMDB">
              Supplies all movie and TV information. Browsing and searching sends
              requests to TMDB. If — and only if — you connect a TMDB account,
              changes to your watchlist, favorites and ratings are mirrored to
              your TMDB account, because that is the point of connecting it. Your
              watched history is never sent to TMDB; TMDB has no such concept and
              it stays private to Cineast.
            </Definition>
            <p>
              This product uses the TMDB API but is not endorsed or certified by
              TMDB. Their handling of data is governed by{' '}
              <ExternalLink href="https://www.themoviedb.org/privacy-policy">
                TMDB&apos;s privacy policy
              </ExternalLink>
              .
            </p>
          </Section>

          <Section title="Your choices">
            <Definition term="Disconnect TMDB">
              Available from your{' '}
              <Link href="/account" className="text-netflix-red hover:underline">
                account page
              </Link>
              . Your Cineast library is unaffected — it never depended on TMDB —
              and changes simply stop being mirrored. Anything already mirrored
              to TMDB stays there and is yours to remove from TMDB directly.
            </Definition>
            <Definition term="Edit or remove your library">
              Anything you added can be removed at any time from the app.
              Removing an item deletes that record.
            </Definition>
            <Definition term="Delete your account">
              Deleting your account removes your library with it: your watched
              history, watchlist, favorites and TMDB connection are all deleted
              along with the account.
            </Definition>
          </Section>

          <Section title="How long we keep it">
            <p>
              Your library is kept for as long as your account exists, because
              its whole purpose is to remember what you watched. Delete an entry
              and that record goes; delete your account and all of it goes.
              Cached public title metadata may remain, as it is not personal to
              you.
            </p>
          </Section>

          <Section title="Security">
            <p>
              Connections are encrypted in transit. Passwords are hashed by our
              authentication provider and never stored in readable form. TMDB
              session tokens are encrypted at rest with AES-256-GCM and are never
              exposed to the browser. No system is perfectly secure, but access to
              your data is limited to what the app needs to function.
            </p>
          </Section>

          <Section title="Children">
            <p>
              Cineast is not directed at children under 13, and we do not
              knowingly collect their information.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this policy changes in a way that affects what we collect or who
              we share it with, the date at the top will be updated. Continuing to
              use Cineast after a change means you accept the revised policy.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy or your data can be sent to the address
              listed on the project&apos;s repository.
            </p>
          </Section>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="space-y-3 leading-relaxed text-gray-300">{children}</div>
    </section>
  );
}

function Definition({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-4 ring-1 ring-white/10">
      <h3 className="font-semibold text-white">{term}</h3>
      <p className="mt-1 leading-relaxed text-gray-300">{children}</p>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-netflix-red hover:underline"
    >
      {children}
    </a>
  );
}
