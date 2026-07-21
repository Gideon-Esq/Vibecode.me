import { useApp } from '../contexts/AppContext';

export function Header() {
  const { lockVault } = useApp();

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-paper-white dark:bg-midnight-slate border-b border-ink/5 dark:border-paper-white/5">
      <div>
        <h1 className="text-lg font-serif text-ink dark:text-paper-white">
          {formatDate()}
        </h1>
      </div>
      
      <button
        onClick={lockVault}
        className="p-2 min-h-touch min-w-[44px] rounded-lg hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors"
        aria-label="Lock journal"
        title="Lock journal"
      >
        <svg
          className="w-6 h-6 text-ink-muted dark:text-paper-cream/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </button>
    </header>
  );
}
