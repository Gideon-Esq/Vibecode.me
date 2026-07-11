"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Spinner } from "@/components/ui";

const STAGES = [
  "Choosing the right destination…",
  "Checking weather and exchange rates…",
  "Pricing flights and hotels…",
  "Curating things to do and places to eat…",
  "Checking visa guidance…",
  "Writing your day-by-day itinerary…",
  "Balancing everything against your budget…",
];

/**
 * Shown on the trip page when the trip has no plan yet (intake incomplete,
 * planning failed, or planning was interrupted). Drives the plan endpoint
 * and refreshes the page when a plan lands.
 */
export function PlanRunner({
  tripId,
  status,
  followUpQuestions,
}: {
  tripId: string;
  status: string;
  followUpQuestions: string[];
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState(followUpQuestions);
  const [answers, setAnswers] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      3500,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  async function run(answersText?: string) {
    setStage(0);
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/plan`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(answersText ? { answers: answersText } : {}),
      });
      if (res.status === 422) {
        const data = await res.json();
        setQuestions(data.followUpQuestions ?? []);
        setAnswers([]);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Planning failed — please try again.");
        return;
      }
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  if (running) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-sea-soft">
          <Spinner className="size-6 text-sea" />
        </div>
        <p className="font-display text-xl">Voyagoa is planning your journey</p>
        <p className="mt-2 text-sm text-ink-soft" aria-live="polite">
          {STAGES[stage]}
        </p>
        <p className="mt-5 text-xs text-ink-faint">
          This can take a couple of minutes for complex trips.
        </p>
      </Card>
    );
  }

  if (status === "intake" && questions.length > 0) {
    return (
      <Card className="mx-auto max-w-lg p-8">
        <p className="font-display text-xl">A couple of quick details</p>
        <p className="mt-1 text-sm text-ink-soft">
          Voyagoa needs these to build a realistic plan.
        </p>
        <div className="mt-5 space-y-4">
          {questions.map((q, i) => (
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
              />
            </div>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-coral-deep">{error}</p>}
        <Button
          className="mt-6 w-full"
          disabled={answers.filter((a) => a?.trim()).length < questions.length}
          onClick={() => run(questions.map((q, i) => `${q} ${answers[i] ?? ""}`).join(" | "))}
        >
          Plan my trip
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <p className="font-display text-xl">
        {status === "failed" ? "That plan didn't come together" : "Ready to plan"}
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        {status === "failed"
          ? "Something went wrong while generating this trip. Give it another go."
          : "Voyagoa has everything it needs — start the planner."}
      </p>
      {error && <p className="mt-3 text-sm text-coral-deep">{error}</p>}
      <Button className="mt-6" onClick={() => run()}>
        {status === "failed" ? "Try again" : "Generate my plan"}
      </Button>
    </Card>
  );
}
