import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import type { FontTheme } from '../types';

export function Settings() {
  const { settings, updateSettings, lockVault, exportBackup, importBackup } = useApp();
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontThemes: { value: FontTheme; label: string; preview: string }[] = [
    { value: 'handwriting', label: 'Handwriting', preview: 'Caveat' },
    { value: 'handwriting-alt', label: 'Elegant Script', preview: 'Dancing Script' },
    { value: 'serif', label: 'Classic', preview: 'Merriweather' },
    { value: 'sans', label: 'Modern', preview: 'Inter' }
  ];

  // Handle backup export
  const handleExport = async () => {
    setExportStatus('exporting');
    try {
      const backupData = await exportBackup();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurajournal-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  // Handle backup import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('importing');
    try {
      const text = await file.text();
      const success = await importBackup(text);
      setImportStatus(success ? 'done' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full overflow-auto pb-24">
      {/* Header */}
      <div className="px-4 py-6 border-b border-ink/5 dark:border-paper-white/5">
        <h1 className="text-2xl font-serif text-ink dark:text-paper-white">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Font Theme Section */}
        <section>
          <h2 className="text-lg font-serif text-ink dark:text-paper-white mb-3">
            Font Theme
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {fontThemes.map(theme => (
              <button
                key={theme.value}
                onClick={() => updateSettings({ fontTheme: theme.value })}
                className={`p-4 min-h-touch rounded-lg border-2 transition-all text-left ${
                  settings.fontTheme === theme.value
                    ? 'border-accent-gold bg-accent-gold/10'
                    : 'border-ink/10 dark:border-paper-white/10 hover:border-ink/20 dark:hover:border-paper-white/20'
                }`}
              >
                <span
                  className={`block text-lg text-ink dark:text-paper-white ${
                    theme.value.startsWith('handwriting')
                      ? theme.value === 'handwriting'
                        ? 'font-handwriting'
                        : 'font-handwriting-alt'
                      : theme.value === 'serif'
                      ? 'font-serif'
                      : 'font-sans'
                  }`}
                >
                  {theme.preview}
                </span>
                <span className="block text-xs text-ink-muted dark:text-paper-cream/60 font-sans mt-1">
                  {theme.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Appearance Section */}
        <section>
          <h2 className="text-lg font-serif text-ink dark:text-paper-white mb-3">
            Appearance
          </h2>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="w-full flex items-center justify-between p-4 min-h-touch rounded-lg border border-ink/10 dark:border-paper-white/10 hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              <span className="font-sans text-ink dark:text-paper-white">
                {settings.darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <div
              className={`w-12 h-7 rounded-full relative transition-colors ${
                settings.darkMode ? 'bg-accent-gold' : 'bg-ink/20 dark:bg-paper-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </section>

        {/* Backup Section */}
        <section>
          <h2 className="text-lg font-serif text-ink dark:text-paper-white mb-3">
            Backup & Restore
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={exportStatus === 'exporting'}
              className="w-full flex items-center justify-between p-4 min-h-touch rounded-lg border border-ink/10 dark:border-paper-white/10 hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="font-sans text-ink dark:text-paper-white">
                  Export Encrypted Backup
                </span>
              </div>
              {exportStatus === 'exporting' && (
                <svg className="animate-spin h-5 w-5 text-accent-gold" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {exportStatus === 'done' && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <label className="w-full flex items-center justify-between p-4 min-h-touch rounded-lg border border-ink/10 dark:border-paper-white/10 hover:bg-ink/5 dark:hover:bg-paper-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="font-sans text-ink dark:text-paper-white">
                  Import Backup
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              {importStatus === 'importing' && (
                <svg className="animate-spin h-5 w-5 text-accent-gold" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {importStatus === 'done' && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {importStatus === 'error' && (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </label>
          </div>
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-lg font-serif text-ink dark:text-paper-white mb-3">
            Security
          </h2>
          <button
            onClick={lockVault}
            className="w-full flex items-center gap-3 p-4 min-h-touch rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-sans text-red-500">Lock Journal</span>
          </button>
        </section>

        {/* About Section */}
        <section className="pt-4 border-t border-ink/5 dark:border-paper-white/5">
          <div className="text-center">
            <p className="text-sm text-ink-muted dark:text-paper-cream/50 font-sans">
              AuraJournal v1.0.0
            </p>
            <p className="text-xs text-ink-muted dark:text-paper-cream/40 font-sans mt-1">
              🔒 Zero-knowledge encryption • Local-first storage
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
