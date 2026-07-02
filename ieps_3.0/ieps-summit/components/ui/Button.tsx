import Link from "next/link";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "btn-ripple inline-flex items-center justify-center gap-2 rounded-none font-label font-semibold uppercase tracking-[0.14em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  // gold CTA — primary conversion action (reads on both light and dark surfaces)
  primary:
    "bg-gold text-navy-950 hover:bg-gold-light shadow-gold ring-offset-white",
  secondary: "bg-navy text-white hover:bg-navy-light ring-offset-white",
  outline:
    "border border-gold/60 text-white hover:bg-gold hover:text-navy-950 ring-offset-navy",
  ghost: "text-navy hover:bg-navy/5 ring-offset-white",
};

const sizes: Record<Size, string> = {
  // min-h keeps a comfortable >=44px touch target
  sm: "min-h-[40px] px-4 text-xs",
  md: "min-h-[48px] px-6 text-sm",
  lg: "min-h-[56px] px-8 text-sm sm:text-base",
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
