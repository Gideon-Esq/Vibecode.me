/**
 * The Cineast lockup: a "C" monogram beside the wordmark.
 *
 * The monogram matches app/icon.svg, so the browser tab and the header read as
 * the same brand.
 */
export function Logo({
  className = '',
  showMark = true,
  size = 'md',
}: {
  className?: string;
  showMark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const wordmark = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-4xl',
  }[size];

  const mark = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7 md:h-8 md:w-8',
    lg: 'h-10 w-10',
  }[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {showMark && <LogoMark className={mark} />}
      <span
        className={`font-bold tracking-wider text-netflix-red ${wordmark}`}
      >
        CINEAST
      </span>
    </span>
  );
}

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#E50914" />
      <path
        d="M45 21.5a17 17 0 1 0 0 21"
        fill="none"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
