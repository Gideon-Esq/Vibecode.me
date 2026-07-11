import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variant === "primary" &&
          "bg-coral text-white hover:bg-coral-deep shadow-[0_2px_12px_rgba(255,90,60,0.35)]",
        variant === "secondary" &&
          "bg-ink text-paper hover:bg-ink-soft",
        variant === "ghost" &&
          "bg-transparent text-ink hover:bg-paper-soft border border-line",
        variant === "danger" &&
          "bg-transparent text-coral-deep hover:bg-red-50 border border-line",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20 placeholder:text-ink-faint",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-line bg-card px-4 py-3 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20 placeholder:text-ink-faint resize-none",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5", className)}>
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "sea" | "coral" | "sand";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "neutral" && "bg-paper-soft text-ink-soft",
        tone === "sea" && "bg-sea-soft text-sea",
        tone === "coral" && "bg-coral/10 text-coral-deep",
        tone === "sand" && "bg-sand text-ink-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marks whether a datum is live/verified or an AI estimate. */
export function SourceBadge({ source }: { source: "live" | "ai_estimate" }) {
  return source === "live" ? (
    <Badge tone="sea"><span className="size-1.5 rounded-full bg-sea" aria-hidden />live data</Badge>
  ) : (
    <Badge tone="sand"><span className="size-1.5 rounded-full border border-current" aria-hidden />AI estimate</Badge>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent align-middle",
        className,
      )}
      aria-label="Loading"
    />
  );
}
