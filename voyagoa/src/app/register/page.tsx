import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign up — Voyagoa" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/trips");

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="font-display text-3xl font-semibold">Start planning smarter</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Your home city and passport help Voyagoa personalize flights and visa guidance.
        </p>
        <div className="mt-8">
          <Suspense>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
