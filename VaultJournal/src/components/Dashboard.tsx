import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, type EncryptedEntry } from '../services/StorageService';
import { CryptoService } from '../services/CryptoService';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Search, Settings as SettingsIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Editor } from './Editor';
import { Settings } from './Settings';

interface EntryStub {
  id: number;
  title: string;
  createdAt: Date;
}

export const Dashboard = () => {
  const { key } = useAuth();
  const [entries, setEntries] = useState<EntryStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'editor' | 'settings'>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, [key, view]);

  const loadEntries = async () => {
    if (!key) return;
    if (view !== 'list') return; // Don't load if not in list view (optimization)

    setLoading(true);
    try {
      const encrypted = await StorageService.getEntries();
      const decrypted = await Promise.all(encrypted.map(async (e) => {
        try {
            const title = await CryptoService.decrypt(e.titleData, e.titleIv, key);
            return {
              id: e.id!,
              title,
              createdAt: e.createdAt
            };
        } catch (err) {
            console.error("Failed to decrypt entry", e.id);
            return { id: e.id!, title: "Decryption Error", createdAt: e.createdAt };
        }
      }));
      setEntries(decrypted);
    } catch (e) {
      console.error("Failed to load entries", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = entries.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  if (view === 'editor') {
    return <Editor id={selectedId} onBack={() => { setView('list'); setSelectedId(null); }} />;
  }

  if (view === 'settings') {
      return <Settings onBack={() => setView('list')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            className="pl-10"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={() => setView('settings')} className="p-2" aria-label="Settings">
                <SettingsIcon className="w-5 h-5" />
            </Button>
            <Button onClick={() => { setSelectedId(null); setView('editor'); }}>
            <Plus className="w-5 h-5 mr-1 inline" /> <span className="hidden sm:inline">New Entry</span>
            </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Decrypting vault...</div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filtered.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => { setSelectedId(entry.id); setView('editor'); }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700 group"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-serif mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {entry.title || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {format(entry.createdAt, 'MMM d, yyyy · h:mm a')}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
              {search ? 'No matching entries found.' : 'Your journal is empty. Start writing!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
