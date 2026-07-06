"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  User,
  GraduationCap,
  ListChecks,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EVENT } from "@/lib/constants";
import {
  registrationFormSchema,
  registrationDefaults,
  type RegistrationFormValues,
  GENDERS,
  LEVELS,
  HEARD_ABOUT_OPTIONS,
  SESSIONS,
  INSTITUTIONS,
  INSTITUTION_OTHER,
  FACULTIES,
  FACULTY_OF_EDUCATION,
  EDUCATION_DEPARTMENTS,
} from "@/lib/registration";

const STEPS = [
  { title: "Personal", icon: User },
  { title: "Academic", icon: GraduationCap },
  { title: "Preferences", icon: ListChecks },
  { title: "Review", icon: CheckCircle2 },
] as const;

const STEP_FIELDS: (keyof RegistrationFormValues)[][] = [
  ["fullName", "email", "phone", "gender"],
  ["institution", "faculty", "department", "level"],
  ["sessionInterest", "heardAboutUs"],
  ["confirmAttendance"],
];

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-ink placeholder-ink/35 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40";

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-red-400 focus:border-red-400" : "border-navy/15 focus:border-gold"}`;
}

/* ── Small presentational helpers ─────────────────────────── */

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: FieldError;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-[0.14em] text-navy/70"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
      {error?.message && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-navy/10 py-2.5 sm:flex-row sm:gap-4">
      <dt className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-green sm:w-44 sm:shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-ink/85">{value || "—"}</dd>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function RegisterPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [[step, direction], setStep] = useState<[number, number]>([0, 0]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Tracks the institution dropdown selection ("Other" reveals a text input).
  const [institutionChoice, setInstitutionChoice] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: registrationDefaults,
    mode: "onTouched",
  });

  const values = watch();

  const goTo = (next: number) =>
    setStep(([curr]) => [next, next > curr ? 1 : -1]);

  async function handleNext() {
    setServerError(null);
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) goTo(Math.min(step + 1, STEPS.length - 1));
  }

  function handleBack() {
    setServerError(null);
    goTo(Math.max(step - 1, 0));
  }

  async function onSubmit(data: RegistrationFormValues) {
    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 201) {
        const body = await res.json();
        // Stash a summary so the success page can render without another fetch.
        sessionStorage.setItem(
          "ieps:registration",
          JSON.stringify({
            id: body.id as string,
            fullName: data.fullName,
            email: data.email,
            institution: data.institution,
            role: "Student",
            sessions: data.sessionInterest,
            emailSent: body.emailSent ?? false,
          })
        );
        router.push("/register/success");
        return;
      }

      if (res.status === 409) {
        setError("email", {
          type: "manual",
          message: "This email is already registered for IEPS 3.0.",
        });
        setServerError("This email is already registered for IEPS 3.0.");
        goTo(0);
        setSubmitting(false);
        return;
      }

      const body = await res.json().catch(() => null);
      setServerError(
        body?.error ?? "Something went wrong. Please review your details and try again."
      );
      setSubmitting(false);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const slide = {
    enter: (dir: number) => ({ x: reduce ? 0 : dir > 0 ? 56 : -56, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduce ? 0 : dir > 0 ? -56 : 56, opacity: 0 }),
  };

  return (
    <div className="bg-offwhite">
      {/* Navy header */}
      <section className="relative overflow-hidden bg-navy pb-24 pt-28 text-white lg:pt-32">
        <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative text-center">
          <p className="eyebrow text-gold">Registration</p>
          <h1 className="heading-display mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Register for IEPS <span className="text-gold">3.0</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-white/75">
            Free to attend. Takes under two minutes. {EVENT.dateLabel}.
          </p>
        </div>
      </section>

      {/* Form card pulled up over the header */}
      <div className="container-section relative -mt-16 pb-20 lg:-mt-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-9">
          {/* Progress bar */}
          <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Registration steps">
            {STEPS.map((s, i) => {
              const state =
                i < step ? "done" : i === step ? "current" : "upcoming";
              return (
                <li key={s.title} className="flex flex-col items-center gap-2">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors duration-200 ${
                      state === "done"
                        ? "border-green bg-green text-white"
                        : state === "current"
                          ? "border-green-light bg-green-light text-white"
                          : "border-navy/15 bg-white text-navy/40"
                    }`}
                    aria-current={state === "current" ? "step" : undefined}
                  >
                    {state === "done" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-center font-label text-[11px] font-semibold uppercase tracking-wide sm:text-xs ${
                      state === "upcoming" ? "text-navy/40" : "text-navy"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="h-1 w-full rounded-full bg-navy/10">
                    <span
                      className={`block h-1 rounded-full transition-all duration-300 ${
                        i <= step ? "w-full bg-gold" : "w-0"
                      }`}
                    />
                  </span>
                </li>
              );
            })}
          </ol>

          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {/* STEP 1 — Personal */}
                {step === 0 && (
                  <div className="space-y-5">
                    <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
                      <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        className={fieldClass(!!errors.fullName)}
                        placeholder="e.g. Adaeze Okoro"
                        {...register("fullName")}
                      />
                    </Field>

                    <Field label="Email address" htmlFor="email" required error={errors.email}>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={fieldClass(!!errors.email)}
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                    </Field>

                    <Field
                      label="Phone number"
                      htmlFor="phone"
                      required
                      error={errors.phone}
                      hint="11 digits, e.g. 08123456789"
                    >
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        className={fieldClass(!!errors.phone)}
                        placeholder="08123456789"
                        {...register("phone")}
                      />
                    </Field>

                    <Field label="Gender" htmlFor="gender" required error={errors.gender}>
                      <select
                        id="gender"
                        className={fieldClass(!!errors.gender)}
                        defaultValue=""
                        {...register("gender")}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}

                {/* STEP 2 — Academic */}
                {step === 1 && (
                  <div className="space-y-5">
                    <Field
                      label="Institution / University"
                      htmlFor="institution"
                      required
                      error={errors.institution}
                    >
                      <select
                        id="institution"
                        className={fieldClass(!!errors.institution)}
                        value={institutionChoice}
                        onChange={(e) => {
                          const v = e.target.value;
                          setInstitutionChoice(v);
                          if (v === INSTITUTION_OTHER) {
                            // Clear so the user types their own name.
                            setValue("institution", "", { shouldValidate: false });
                          } else {
                            setValue("institution", v, { shouldValidate: true });
                          }
                        }}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {INSTITUTIONS.map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      {institutionChoice === INSTITUTION_OTHER && (
                        <input
                          id="institutionOther"
                          type="text"
                          className={`${fieldClass(!!errors.institution)} mt-2`}
                          placeholder="Type your institution name"
                          aria-label="Institution name"
                          autoFocus
                          {...register("institution")}
                        />
                      )}
                    </Field>

                    <Field label="Faculty" htmlFor="faculty" required error={errors.faculty}>
                      <select
                        id="faculty"
                        className={fieldClass(!!errors.faculty)}
                        defaultValue=""
                        {...register("faculty", {
                          onChange: () =>
                            // The department value belongs to whichever faculty
                            // was previously selected — clear it so the user
                            // re-enters it in the newly-shown field.
                            setValue("department", "", { shouldValidate: false }),
                        })}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {FACULTIES.map((f) => (
                          <option key={f} value={f}>
                            {f === "Other" ? "Other (not Education)" : f}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={
                        values.faculty === FACULTY_OF_EDUCATION
                          ? "Department"
                          : "Department / Faculty"
                      }
                      htmlFor="department"
                      required
                      error={errors.department}
                    >
                      {values.faculty === FACULTY_OF_EDUCATION ? (
                        <select
                          id="department"
                          className={fieldClass(!!errors.department)}
                          defaultValue=""
                          {...register("department")}
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {EDUCATION_DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id="department"
                          type="text"
                          className={fieldClass(!!errors.department)}
                          placeholder="e.g. Educational Management"
                          {...register("department")}
                        />
                      )}
                    </Field>

                    <Field label="Level of study" htmlFor="level" required error={errors.level}>
                      <select
                        id="level"
                        className={fieldClass(!!errors.level)}
                        defaultValue=""
                        {...register("level")}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}

                {/* STEP 3 — Preferences */}
                {step === 2 && (
                  <div className="space-y-6">
                    <Field
                      label="Sessions you're most interested in"
                      htmlFor="sessionInterest"
                      required
                      error={errors.sessionInterest as FieldError | undefined}
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {SESSIONS.map((session) => (
                          <label
                            key={session}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/15 bg-white p-3 text-sm transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:bg-gold/5"
                          >
                            <input
                              type="checkbox"
                              value={session}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
                              {...register("sessionInterest")}
                            />
                            <span className="text-ink/85">{session}</span>
                          </label>
                        ))}
                      </div>
                    </Field>

                    <Field
                      label="How did you hear about IEPS 3.0?"
                      htmlFor="heardAboutUs"
                      required
                      error={errors.heardAboutUs}
                    >
                      <select
                        id="heardAboutUs"
                        className={fieldClass(!!errors.heardAboutUs)}
                        defaultValue=""
                        {...register("heardAboutUs")}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {HEARD_ABOUT_OPTIONS.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}

                {/* STEP 4 — Review */}
                {step === 3 && (
                  <div>
                    <h2 className="font-display text-xl font-bold text-navy">
                      Review your details
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Please confirm everything is correct before submitting.
                    </p>

                    <dl className="mt-5">
                      <SummaryRow label="Full name" value={values.fullName} />
                      <SummaryRow label="Email" value={values.email} />
                      <SummaryRow label="Phone" value={values.phone} />
                      <SummaryRow label="Gender" value={values.gender} />
                      <SummaryRow label="Institution" value={values.institution} />
                      <SummaryRow label="Faculty" value={values.faculty} />
                      <SummaryRow label="Department" value={values.department} />
                      <SummaryRow label="Level" value={values.level} />
                      <SummaryRow
                        label="Sessions"
                        value={
                          values.sessionInterest?.length
                            ? values.sessionInterest.join(", ")
                            : ""
                        }
                      />
                      <SummaryRow label="Heard via" value={values.heardAboutUs} />
                    </dl>

                    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-navy/15 bg-offwhite p-4 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
                        {...register("confirmAttendance")}
                      />
                      <span className="text-sm text-ink/85">
                        I confirm my details are correct and I intend to attend IEPS
                        3.0 on <strong>22nd July 2026</strong>.
                      </span>
                    </label>
                    {errors.confirmAttendance?.message && (
                      <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600" role="alert">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors.confirmAttendance.message}
                      </p>
                    )}

                    <div className="mt-5 flex items-start gap-2 rounded-xl bg-navy/5 p-4 text-sm text-ink/70">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span>{EVENT.dateLabel}</span>
                      <MapPin className="ml-3 mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span>{EVENT.venue.shortName}, {EVENT.venue.city}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={handleBack} disabled={submitting}>
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </Button>
              ) : (
                <span aria-hidden />
              )}

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-ink/50">
          Step {step + 1} of {STEPS.length}. Your information is used only for
          IEPS 3.0 attendance and communication.
        </p>
      </div>
    </div>
  );
}
