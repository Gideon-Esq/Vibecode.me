"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Spinner } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const fromComposer = params.get("from") === "composer";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    homeCity: "",
    passportCountry: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              homeCity: form.homeCity || undefined,
              passportCountry: form.passportCountry || undefined,
            },
      ),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setBusy(false);
      return;
    }

    // If the user arrived mid-composition, send them back to finish planning.
    router.push(fromComposer ? "/" : "/trips");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fromComposer && (
        <p className="rounded-xl bg-green-soft px-4 py-3 text-sm text-green">
          Create your account and Voyagoa will pick your trip right back up.
        </p>
      )}
      {mode === "register" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <Input required value={form.name} onChange={set("name")} placeholder="Ada Lovelace" />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Email</label>
        <Input
          required
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Password</label>
        <Input
          required
          type="password"
          minLength={mode === "register" ? 8 : undefined}
          value={form.password}
          onChange={set("password")}
          placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
        />
      </div>
      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Home city <span className="text-ink-faint">(optional)</span>
            </label>
            <Input value={form.homeCity} onChange={set("homeCity")} placeholder="Lagos" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Passport <span className="text-ink-faint">(optional)</span>
            </label>
            <Input
              value={form.passportCountry}
              onChange={set("passportCountry")}
              placeholder="Nigeria"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-blue-dark">{error}</p>}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? <Spinner /> : mode === "login" ? "Log in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New to Voyagoa?{" "}
            <Link href="/register" className="font-medium text-blue-dark hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-dark hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
