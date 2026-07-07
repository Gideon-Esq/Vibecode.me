import { NavLink } from 'react-router-dom';
import { Book, PenTool, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-paper border-t border-ink/10 flex items-center justify-around px-6 z-50 pb-safe">
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center justify-center p-2 text-ink/40 transition-colors",
            isActive && "text-ink"
          )
        }
      >
        <Book size={24} strokeWidth={1.5} />
        <span className="text-[10px] mt-1 font-medium tracking-wide">Journal</span>
      </NavLink>

      <div className="relative -top-6">
        <NavLink
          to="/write"
          className={({ isActive }) =>
            cn(
              "flex items-center justify-center w-14 h-14 rounded-full bg-ink text-paper shadow-lg shadow-ink/20 transition-transform active:scale-95",
              isActive && "ring-4 ring-paper"
            )
          }
        >
          <PenTool size={24} strokeWidth={1.5} />
        </NavLink>
      </div>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center justify-center p-2 text-ink/40 transition-colors",
            isActive && "text-ink"
          )
        }
      >
        <Settings size={24} strokeWidth={1.5} />
        <span className="text-[10px] mt-1 font-medium tracking-wide">Settings</span>
      </NavLink>
    </nav>
  );
};
