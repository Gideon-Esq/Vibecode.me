"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  SearchX,
  Building2,
  Award,
} from "lucide-react";

type Match = { id: string; fullName: string; institution: string };

type Status = "idle" | "loading" | "done" | "error";

/** URL-safe slug of the attendee's name for the download filename hint. */
function nameSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "participant"
  );
}

export function CertificateFinder() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Match[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The term actually searched — so the empty state can echo it back.
  const [searched, setSearched] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setError(null);

    if (q.length < 2) {
      setError("Please enter at least 2 characters of your name.");
      return;
    }

    setStatus("loading");
    setSearched(q);

    try {
      const res = await fetch(
        `/api/certificate/search?q=${encodeURIComponent(q)}`
      );
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setResults([]);
        setError(
          body?.error ??
            "Something went wrong searching for your certificate. Please try again."
        );
        return;
      }

      setResults(body.results ?? []);
      setHasMore(Boolean(body.hasMore));
      setStatus("done");
    } catch {
      setStatus("error");
      setResults([]);
      setError("Network error. Please check your connection and try again.");
    }
  }

  const showEmpty = status === "done" && results.length === 0;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Search card */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
        <form onSubmit={onSubmit} noValidate>
          <label
            htmlFor="cert-search"
            className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.14em] text-navy/70"
          >
            Your full name
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/35" />
              <input
                id="cert-search"
                type="text"
                autoComplete="name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Adaeze Okoro"
                className="w-full rounded-xl border border-navy/15 bg-white py-3 pl-12 pr-4 text-ink placeholder-ink/35 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-ripple inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold px-6 font-display font-semibold text-navy-950 shadow-gold transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Find certificate
                </>
              )}
            </button>
          </div>

          {error && (
            <p
              className="mt-3 flex items-center gap-1.5 text-sm text-red-600"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </form>

        <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-ink/50">
          <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          Search with the name you registered with. Certificates are issued
          after the summit — if you attended and can&apos;t find yours yet,
          please check back later.
        </p>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {status === "done" && results.length > 0 && (
          <motion.div
            key="results"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-6"
          >
            <p className="mb-3 px-1 font-label text-xs font-semibold uppercase tracking-[0.14em] text-navy/60">
              {results.length} {results.length === 1 ? "match" : "matches"} found
            </p>

            <ul className="space-y-3">
              {results.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-navy">
                      {r.fullName}
                    </p>
                    {r.institution && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/60">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-green" />
                        <span className="truncate">{r.institution}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`/api/certificate/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-navy/15 px-4 font-display text-sm font-semibold text-ink/70 transition-colors hover:bg-navy/5"
                      title="Preview in a new tab"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </a>
                    <a
                      href={`/api/certificate/${r.id}?download=1`}
                      download={`IEPS-3.0-Certificate-${nameSlug(r.fullName)}.pdf`}
                      className="btn-ripple inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-green px-5 font-display text-sm font-semibold text-white shadow-gold transition-colors hover:bg-green-light sm:flex-none"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            {hasMore && (
              <p className="mt-4 rounded-xl bg-navy/5 px-4 py-3 text-center text-sm text-ink/60">
                Showing the first {results.length} matches. Add your surname to
                narrow the search.
              </p>
            )}
          </motion.div>
        )}

        {showEmpty && (
          <motion.div
            key="empty"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-6 rounded-3xl border border-dashed border-navy/20 bg-white/60 p-8 text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy/5">
              <SearchX className="h-7 w-7 text-navy/40" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-navy">
              No certificate found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-ink/60">
              We couldn&apos;t find an issued certificate for{" "}
              <span className="font-semibold text-navy">
                &ldquo;{searched}&rdquo;
              </span>
              . Double-check the spelling, or if you attended and certificates
              have been released, please contact the organising team.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
