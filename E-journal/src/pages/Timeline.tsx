import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Entry } from '@/services/db';
import { useAuth } from '@/context/AuthContext';
import { CryptoService, EncryptedData } from '@/services/crypto';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const DecryptedEntry = ({ entry, dek }: { entry: Entry; dek: CryptoKey }) => {
  const [title, setTitle] = useState<string>('Decrypting...');
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const decryptContent = async () => {
      try {
        const titleData: EncryptedData = { ciphertext: entry.titleCipher, iv: entry.titleIv };
        const bodyData: EncryptedData = { ciphertext: entry.bodyCipher, iv: entry.bodyIv };

        const decryptedTitle = await CryptoService.decrypt(titleData, dek);
        // Only decrypt a snippet of body for preview if needed, or just full body but truncate in UI.
        // Decrypting full body might be heavy if very long, but for a journal it's probably okay.
        const decryptedBody = await CryptoService.decrypt(bodyData, dek);

        setTitle(decryptedTitle || 'Untitled');
        setPreview(decryptedBody.slice(0, 100).replace(/\n/g, ' ') + (decryptedBody.length > 100 ? '...' : ''));
      } catch (e) {
        console.error("Failed to decrypt entry", entry.id, e);
        setTitle("Error Decrypting");
      }
    };
    decryptContent();
  }, [entry, dek]);

  return (
    <Link
      to={`/edit/${entry.id}`} // We might need an edit route that takes an ID
      className="block p-4 mb-3 bg-white/50 border border-ink/5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-lg font-serif font-semibold text-ink">{title}</h3>
        <span className="text-xs font-sans text-ink/40">{format(new Date(entry.date), 'h:mm a')}</span>
      </div>
      <p className="text-sm font-sans text-ink/60 line-clamp-2">{preview}</p>
    </Link>
  );
};

export const Timeline = () => {
  const { dek } = useAuth();
  const entries = useLiveQuery(() => db.entries.orderBy('date').reverse().toArray());

  if (!entries) return <div className="p-8 text-center text-ink/40">Loading journal...</div>;
  if (!dek) return <div className="p-8 text-center text-ink/40">Locked</div>;
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center mb-4">
          <span className="text-2xl">✒️</span>
        </div>
        <h2 className="text-xl font-serif text-ink mb-2">Your story begins here</h2>
        <p className="text-ink/50 max-w-xs">Tap the pen button below to write your first entry.</p>
      </div>
    );
  }

  // Group by Year -> Month
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const year = format(date, 'yyyy');
    const month = format(date, 'MMMM');
    const day = format(date, 'd');

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = {};
    if (!acc[year][month][day]) acc[year][month][day] = [];

    acc[year][month][day].push(entry);
    return acc;
  }, {} as Record<string, Record<string, Record<string, Entry[]>>>);

  return (
    <div className="space-y-8 pb-8">
      {Object.entries(grouped).map(([year, months]) => (
        <div key={year} className="space-y-6">
          <div className="sticky top-0 z-10 py-2 bg-paper/95 backdrop-blur-sm -mx-2 px-2">
            <h2 className="text-3xl font-serif font-black text-ink/10">{year}</h2>
          </div>

          {Object.entries(months).map(([month, days]) => (
            <div key={month} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40 pl-1">{month}</h3>

              {Object.entries(days).map(([day, dayEntries]) => (
                <div key={day} className="relative pl-6 border-l-2 border-ink/5 ml-2">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-paper border-2 border-ink/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-ink/20" />
                  </div>

                  <div className="mb-2 text-xl font-serif text-ink/80">{day}</div>

                  <div className="space-y-2">
                    {dayEntries.map(entry => (
                      <DecryptedEntry key={entry.id} entry={entry} dek={dek} />
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
};
