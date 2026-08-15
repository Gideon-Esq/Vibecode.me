'use client';

import { motion } from 'framer-motion';
import { CheckIcon } from './icons';

/**
 * The "already watched" marker that sits on a poster.
 *
 * `compact` is the corner pip used on grid cards; the default size is for the
 * movie detail page where there is room for the label.
 */
export function WatchedBadge({
  compact = false,
  rewatchCount = 1,
  className = '',
}: {
  compact?: boolean;
  rewatchCount?: number;
  className?: string;
}) {
  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        title={rewatchCount > 1 ? `Watched ${rewatchCount} times` : 'Already watched'}
        className={`flex items-center gap-1 rounded-full bg-emerald-500 pl-1.5 pr-2 py-1 text-black shadow-lg shadow-black/40 ring-2 ring-black/30 ${className}`}
      >
        <CheckIcon className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {rewatchCount > 1 ? `${rewatchCount}×` : 'Watched'}
        </span>
      </motion.div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-400 ring-1 ring-emerald-500/40 ${className}`}
    >
      <CheckIcon className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {rewatchCount > 1 ? `Watched ${rewatchCount} times` : 'Already watched'}
      </span>
    </div>
  );
}
