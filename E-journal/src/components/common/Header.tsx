import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const { lock } = useAuth();
  const today = new Date();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-paper/80 backdrop-blur-sm z-40 px-6 flex items-center justify-between border-b border-ink/5">
      <div>
        <h1 className="text-xl font-serif font-bold text-ink tracking-tight">
          {format(today, 'MMMM do')}
        </h1>
        <p className="text-xs text-ink/40 font-medium uppercase tracking-widest">
          {format(today, 'EEEE, yyyy')}
        </p>
      </div>

      <button
        onClick={lock}
        className="p-2 -mr-2 text-ink/60 hover:text-ink transition-colors rounded-full hover:bg-ink/5"
        aria-label="Lock Journal"
      >
        <Lock size={20} strokeWidth={1.5} />
      </button>
    </header>
  );
};
