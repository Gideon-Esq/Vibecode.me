import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import type { DecryptedEntry, TimelineGroup, MonthGroup, DayGroup } from '../types';

interface TimelineProps {
  onSelectEntry: (entry: DecryptedEntry) => void;
}

export function Timeline({ onSelectEntry }: TimelineProps) {
  const { entries } = useApp();

  // Group entries by Year -> Month -> Day
  const timeline = useMemo(() => {
    const groups: Map<number, Map<number, Map<number, DecryptedEntry[]>>> = new Map();
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      if (!groups.has(year)) {
        groups.set(year, new Map());
      }
      const yearGroup = groups.get(year)!;
      
      if (!yearGroup.has(month)) {
        yearGroup.set(month, new Map());
      }
      const monthGroup = yearGroup.get(month)!;
      
      if (!monthGroup.has(day)) {
        monthGroup.set(day, []);
      }
      monthGroup.get(day)!.push(entry);
    });
    
    // Convert to array structure
    const result: TimelineGroup[] = [];
    
    const sortedYears = Array.from(groups.keys()).sort((a, b) => b - a);
    sortedYears.forEach(year => {
      const yearData = groups.get(year)!;
      const months: MonthGroup[] = [];
      
      const sortedMonths = Array.from(yearData.keys()).sort((a, b) => b - a);
      sortedMonths.forEach(month => {
        const monthData = yearData.get(month)!;
        const days: DayGroup[] = [];
        
        const sortedDays = Array.from(monthData.keys()).sort((a, b) => b - a);
        sortedDays.forEach(day => {
          days.push({
            day,
            date: new Date(year, month, day),
            entries: monthData.get(day)!.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          });
        });
        
        months.push({
          month,
          monthName: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' }),
          days
        });
      });
      
      result.push({ year, months });
    });
    
    return result;
  }, [entries]);

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get preview text (first line or first 80 chars)
  const getPreview = (content: string) => {
    const firstLine = content.split('\n')[0] || '';
    return firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine || 'Untitled entry';
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-accent-gold/10 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-accent-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-xl font-serif text-ink dark:text-paper-white mb-2">
          Your journal awaits
        </h3>
        <p className="text-ink-muted dark:text-paper-cream/60 font-sans">
          Tap the + button to write your first entry
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto pb-24">
      {timeline.map(yearGroup => (
        <div key={yearGroup.year} className="mb-6">
          {/* Year Header */}
          <div className="sticky top-0 z-10 px-4 py-2 bg-paper-white/95 dark:bg-midnight-slate/95 backdrop-blur-sm">
            <h2 className="text-2xl font-serif text-ink dark:text-paper-white">
              {yearGroup.year}
            </h2>
          </div>
          
          {yearGroup.months.map(monthGroup => (
            <div key={monthGroup.month} className="mb-4">
              {/* Month Header */}
              <div className="px-4 py-2">
                <h3 className="text-lg font-serif text-accent-gold">
                  {monthGroup.monthName}
                </h3>
              </div>
              
              {monthGroup.days.map(dayGroup => (
                <div key={dayGroup.day} className="mb-2">
                  {/* Day Header */}
                  <div className="px-4 py-1">
                    <span className="text-sm font-sans text-ink-muted dark:text-paper-cream/60">
                      {dayGroup.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Entries */}
                  <div className="space-y-1">
                    {dayGroup.entries.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => onSelectEntry(entry)}
                        className="w-full text-left px-4 py-3 min-h-touch hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors animate-fade-in"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-ink-muted dark:text-paper-cream/50 font-sans mt-1 shrink-0">
                            {formatTime(entry.createdAt)}
                          </span>
                          <p className="text-ink dark:text-paper-white font-serif line-clamp-2">
                            {getPreview(entry.content)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
