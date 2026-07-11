"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner, Textarea, Input } from "@/components/ui";

const EXAMPLES = [
  "I have $2,500 and 10 days. I want to travel from Lagos to somewhere exciting in Europe.",
  "£1,800, 7 days from London — somewhere warm with great food in late September.",
  "Two of us, $4,000 and 12 days from New York. Thinking Japan.",
];

const PLANNING_STAGES = [
  "Reading your request…",
  "Choosing the right destination…",
  "Checking weather and exchange rates…",
  "Pricing flights and hotels…",
  "Curating things to do and places to eat…",
  "Checking visa guidance…",
  "Writing your day-by-day itinerary…",
  "Balancing everything against your budget…",
];

type Phase =
  | { name: "idle" }
  | { name: "submitting" }
  | { name: "questions"; tripId: string; questions: string[] }
  | { name: "planning" }
  | { name: "error"; message: string };

export function TripComposer({ authed }: { authed: boolean }) {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [stage, setStage] = useState(0);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore a request stashed before signup
  useEffect(() => {
    const stashed = sessionStorage.getItem("voyagoa:pending-request");
    if (stashed && authed) {
      sessionStorage.removeItem("voyagoa:pending-request");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot restore from external storage on mount
      setRequest(stashed);
    }
  }, [authed]);

  useEffect(() => {
    if (phase.name !== "planning") return;
    stageTimer.current = setInterval(
      () => setStage((s) => Math.min(s + 1, PLANNING_STAGES.length - 1)),
      3500,
    );
    return () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
    };
  }, [phase.name]);

  async function startPlanning(tripId: string, answersText?: string) {
    setStage(0);
    setPhase({ name: "planning" });
    const res = await fetch(`/api/trips/${tripId}/plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(answersText ? { answers: answersText } : {}),
    });
    if (res.status === 422) {
      const data = await res.json();
      setAnswers([]);
      setPhase({ name: "questions", tripId, questions: data.followUpQuestions ?? [] });
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPhase({ name: "error", message: data.error ?? "Planning failed — please try again." });
      return;
    }
    router.push(`/trips/${tripId}`);
  }

  async function submit() {
    if (request.trim().length < 10) {
      setPhase({ name: "error", message: "Tell Voyagoa a little more — budget, days, and where from." });
      return;
    }
    if (!authed) {
      sessionStorage.setItem("voyagoa:pending-request", request);
      router.push("/register?from=composer");
      return;
    }

    setPhase({ name: "submitting" });
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ request }),
    });
    if (res.status === 401) {
      sessionStorage.setItem("voyagoa:pending-request", request);
      router.push("/register?from=composer");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPhase({ name: "error", message: data.error ?? "Something went wrong." });
      return;
    }
    const data = await res.json();
    if (data.intake?.complete) {
      await startPlanning(data.trip.id);
    } else {
      setAnswers([]);
      setPhase({
        name: "questions",
        tripId: data.trip.id,
        questions: data.intake?.followUpQuestions ?? [],
      });
    }
  }

  if (phase.name === "planning") {
    return (
      <div className="rounded-3xl border border-line bg-card p-8 text-center shadow-xl shadow-ink/5">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-sea-soft">
          <Spinner className="size-6 text-sea" />
        </div>
        <p className="font-display text-xl">Voyagoa is planning your journey</p>
        <p className="mt-2 text-sm text-ink-soft" aria-live="polite">
          {PLANNING_STAGES[stage]}
        </p>
        <p className="mt-5 text-xs text-ink-faint">
          This can take a couple of minutes — flights, hotels, food, visas and a full itinerary are being balanced against your budget.
        </p>
      </div>
    );
  }

  if (phase.name === "questions") {
    return (
      <div className="rounded-3xl border border-line bg-card p-6 shadow-xl shadow-ink/5 sm:p-8">
        <p className="font-display text-lg">A couple of quick details</p>
        <p className="mt-1 text-sm text-ink-soft">
          Voyagoa only asks when something essential is missing.
        </p>
        <div className="mt-5 space-y-4">
          {phase.questions.map((q, i) => (
            <div key={i}>
              <label className="mb-1.5 block text-sm font-medium">{q}</label>
              <Input
                value={answers[i] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                placeholder="Your answer"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setPhase({ name: "idle" })}>
            Back
          </Button>
          <Button
            onClick={() =>
              startPlanning(
                phase.tripId,
                phase.questions.map((q, i) => `${q} ${answers[i] ?? ""}`).join(" | "),
              )
            }
            disabled={answers.filter((a) => a?.trim()).length < phase.questions.length}
          >
            Plan my trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-card p-3 shadow-xl shadow-ink/5">
      <Textarea
        rows={3}
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="Tell Voyagoa your budget, available days, and where you'd love to go…"
        className="border-0 bg-transparent text-base focus:ring-0"
        aria-label="Describe your trip"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
        <div className="hidden flex-wrap gap-2 sm:flex">
          {EXAMPLES.slice(0, 2).map((ex) => (
            <button
              key={ex}
              onClick={() => setRequest(ex)}
              className="cursor-pointer rounded-full border border-line px-3 py-1 text-xs text-ink-faint transition hover:border-coral hover:text-ink"
            >
              {ex.length > 52 ? ex.slice(0, 52) + "…" : ex}
            </button>
          ))}
        </div>
        <Button onClick={submit} disabled={phase.name === "submitting"}>
          {phase.name === "submitting" ? <Spinner /> : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M2 21 23 12 2 3l4 9-4 9Zm4-9h17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          )}
          Plan my trip
        </Button>
      </div>
      {phase.name === "error" && (
        <p className="px-2 pb-2 text-sm text-coral-deep">{phase.message}</p>
      )}
    </div>
  );
}
