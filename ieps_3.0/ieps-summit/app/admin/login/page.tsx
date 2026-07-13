"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        {/* White card keeps the navy logo legible on the dark backdrop. */}
        <span className="inline-flex rounded-xl bg-white px-4 py-3 shadow-sm">
          <Image
            src="/logos/ieps.png"
            alt="IEPS 3.0 | Ife Education Parliamentary Summit"
            width={416}
            height={81}
            priority
            className="h-9 w-auto"
          />
        </span>
        <p className="mt-3 font-label text-xs font-semibold uppercase tracking-[0.22em] text-green-400">
          Organiser Dashboard
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-card backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-white">
              Admin sign in
            </h1>
            <p className="text-sm text-white/60">
              Authorised personnel only.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-navy-dark/60 py-3 pl-11 pr-4 text-white placeholder-white/30 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-navy-dark/60 py-3 pl-11 pr-12 text-white placeholder-white/30 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/50 transition-colors hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy px-5 py-24">
      <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 flex w-full justify-center">
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center text-white/60">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
