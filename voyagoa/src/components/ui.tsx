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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-transparent px-6 text-sm font-extrabold transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer",
        variant === "primary" &&
          "bg-blue text-white hover:bg-blue-dark shadow-[0_12px_28px_rgba(17,103,241,0.22)]",
        variant === "secondary" &&
          "bg-navy text-white hover:bg-ink",
        variant === "ghost" &&
          "bg-white text-blue border-blue hover:bg-blue-soft",
        variant === "danger" &&
          "bg-white text-red border-red/40 hover:bg-red-soft",
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
        "w-full rounded-lg border border-line bg-card px-4 py-2.5 text-sm outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20 placeholder:text-ink-faint",
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
        "w-full rounded-lg border border-line bg-card px-4 py-3 text-sm outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20 placeholder:text-ink-faint resize-none",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-line bg-card p-5", className)}>
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "green" | "blue" | "yellow" | "red";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "neutral" && "bg-paper-soft text-ink-soft",
        tone === "green" && "bg-green-soft text-green",
        tone === "blue" && "bg-blue-soft text-blue-dark",
        tone === "yellow" && "bg-yellow-soft text-ink-soft",
        tone === "red" && "bg-red-soft text-red",
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
    <Badge tone="green"><span className="size-1.5 rounded-full bg-green" aria-hidden />live data</Badge>
  ) : (
    <Badge tone="yellow"><span className="size-1.5 rounded-full border border-current" aria-hidden />AI estimate</Badge>
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
