import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/db';
import { format } from 'date-fns';
import { Download, Trash2, LogOut } from 'lucide-react';

export const Settings = () => {
  const { lock, reset } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allEntries = await db.entries.toArray();
      const meta = await db.meta.toArray();

      const backup = {
        version: 1,
        appName: 'AuraJournal',
        timestamp: new Date().toISOString(),
        entries: allEntries,
        meta: meta
      };

      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurajournal-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export backup");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = async () => {
    if (confirm("ARE YOU SURE? This will wipe all data from this device. If you haven't backed up, it will be gone forever.")) {
      if (confirm("Really? This cannot be undone.")) {
        await reset();
      }
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-ink">Settings</h2>
        <p className="text-ink/60 font-sans">Manage your preferences and security.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40">Security & Data</h3>

        <div className="bg-white/50 border border-ink/5 rounded-lg overflow-hidden">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-between p-4 hover:bg-ink/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="text-ink/60" size={20} />
              <div>
                <div className="font-serif font-medium text-ink">Export Backup</div>
                <div className="text-xs text-ink/40">Save an encrypted JSON file</div>
              </div>
            </div>
          </button>

          <div className="h-px bg-ink/5" />

          <button
            onClick={lock}
            className="w-full flex items-center justify-between p-4 hover:bg-ink/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="text-ink/60" size={20} />
              <div>
                <div className="font-serif font-medium text-ink">Lock Journal</div>
                <div className="text-xs text-ink/40">Require password to re-open</div>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-red-500/60">Danger Zone</h3>

        <div className="bg-red-50/50 border border-red-200/50 rounded-lg overflow-hidden">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 hover:bg-red-100/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="text-red-500/60" size={20} />
              <div>
                <div className="font-serif font-medium text-red-600">Wipe All Data</div>
                <div className="text-xs text-red-400">Permanently delete everything</div>
              </div>
            </div>
          </button>
        </div>
      </section>

      <div className="text-center text-xs text-ink/20 pt-8">
        <p>AuraJournal v1.0.0</p>
        <p>Local-First & Encrypted</p>
      </div>
    </div>
  );
};
