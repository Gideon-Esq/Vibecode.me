import Link from "next/link";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "btn-ripple inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  // gold CTA — primary conversion action
  primary: "bg-gold text-navy hover:bg-gold-400 shadow-gold ring-offset-white",
  secondary:
    "bg-emerald text-white hover:bg-emerald-600 ring-offset-white",
  outline:
    "border-2 border-white/70 text-white hover:bg-white hover:text-navy ring-offset-navy",
  ghost: "text-navy hover:bg-navy/5 ring-offset-white",
};

const sizes: Record<Size, string> = {
  // min-h keeps a comfortable >=44px touch target
  sm: "min-h-[40px] px-4 text-sm",
  md: "min-h-[48px] px-6 text-base",
  lg: "min-h-[56px] px-8 text-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Polymorphic button. Renders an <a>/<Link> when `href` is provided,
 * otherwise a native <button>.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);

    if ("href" in props && props.href !== undefined) {
      const { href, external, ...rest } = props as ButtonAsLink;
      if (external) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={classes}
            target="_blank"
            rel="noopener noreferrer"
            {...rest}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...rest}
        >
          {children}
        </Link>
      );
    }

    const { type = "button", ...rest } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
