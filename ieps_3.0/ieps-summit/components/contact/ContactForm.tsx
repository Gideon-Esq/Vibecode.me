"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { CONTACT } from "@/lib/constants";

type FieldErrors = Partial<Record<"name" | "email" | "message", string[]>>;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setErrors({});
    setStatus("idle");
    setErrorText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
        setSending(false);
        return;
      }

      const body = await res.json().catch(() => null);
      if (res.status === 422 && body?.fieldErrors) {
        setErrors(body.fieldErrors as FieldErrors);
      } else {
        setStatus("error");
        setErrorText(body?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorText("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-ink placeholder-ink/35 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${
      hasError ? "border-red-400 focus:border-red-400" : "border-navy/15 focus:border-gold"
    }`;

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-green/30 bg-green/5 p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green text-white">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-navy">
          Message sent!
        </h3>
        <p className="mt-2 text-ink/70">
          Thanks for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-green hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8"
    >
      <h2 className="font-display text-xl font-bold text-navy">
        Send us a message
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        We usually respond within a couple of days.
      </p>

      {status === "error" && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {errorText}{" "}
            <a href={`mailto:${CONTACT.email}`} className="font-semibold underline">
              Email us directly
            </a>
            .
          </span>
        </div>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.14em] text-navy/70">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputCls(!!errors.name)}
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-600">{errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.14em] text-navy/70">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls(!!errors.email)}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600">{errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.14em] text-navy/70">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className={`${inputCls(!!errors.message)} resize-y`}
            placeholder="How can we help?"
          />
          {errors.message && (
            <p className="mt-1.5 text-sm text-red-600">{errors.message[0]}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-display font-semibold text-navy transition-colors hover:bg-gold-light disabled:opacity-60 sm:w-auto"
      >
        {sending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
