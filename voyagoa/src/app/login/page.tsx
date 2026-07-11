import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Log in — Voyagoa" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/trips");

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">Pick up your journeys where you left off.</p>
        <div className="mt-8">
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
