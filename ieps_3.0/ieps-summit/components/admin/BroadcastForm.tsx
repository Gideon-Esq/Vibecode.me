"use client";

import { useState } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function BroadcastForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<
    { ok: boolean; text: string } | null
  >(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (!window.confirm("Send this email to the selected recipients?")) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, status: audience }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        setResult({
          ok: true,
          text: `Sent to ${body.sent}/${body.recipients} recipients${
            body.failed ? ` (${body.failed} failed)` : ""
          }.${body.reason ? ` Note: ${body.reason}` : ""}`,
        });
        setSubject("");
        setMessage("");
      } else {
        setResult({ ok: false, text: body?.error ?? "Failed to send." });
      }
    } catch {
      setResult({ ok: false, text: "Network error." });
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-bold text-navy">Broadcast email</h2>
      <p className="text-sm text-ink/60">
        Send a custom message to registrants. It&apos;s wrapped in IEPS branding
        automatically.
      </p>

      {result && (
        <div
          role="alert"
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            result.ok
              ? "border-green/30 bg-green/10 text-green-dark"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{result.text}</span>
        </div>
      )}

      <div>
        <label htmlFor="audience" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-navy/70">
          Audience
        </label>
        <select
          id="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className={inputCls}
        >
          <option value="ALL">All registrants</option>
          <option value="CONFIRMED">Confirmed only</option>
          <option value="PENDING">Pending only</option>
          <option value="CANCELLED">Cancelled only</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-navy/70">
          Subject
        </label>
        <input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={160}
          className={inputCls}
          placeholder="An update about IEPS 3.0"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-navy/70">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={8}
          maxLength={5000}
          className={`${inputCls} resize-y`}
          placeholder="Write your message. Blank lines start new paragraphs."
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display font-semibold text-navy hover:bg-gold-light disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {sending ? "Sending…" : "Send broadcast"}
      </button>
    </form>
  );
}
