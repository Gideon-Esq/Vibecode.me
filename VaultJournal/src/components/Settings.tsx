import React, { useState } from 'react';
import { Button } from './Button';
import { StorageService } from '../services/StorageService';
import { ArrowLeft, Download, Upload, AlertTriangle } from 'lucide-react';

export const Settings = ({ onBack }: { onBack: () => void }) => {
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const data = await StorageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("This will overwrite your current journal with the backup. Are you sure?")) {
        return;
    }

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const content = event.target?.result as string;
            await StorageService.importData(content);
            alert("Import successful. The app will reload.");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Import failed. Invalid backup file.");
        } finally {
            setImporting(false);
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
       <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold dark:text-white">Settings & Backup</h2>
       </div>

       <div className="space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5" /> Disaster Recovery Export
                </h3>
                <p className="text-sm text-indigo-800 dark:text-indigo-400 mb-4">
                    Download an encrypted backup of your journal. This file contains your data encrypted with your master password.
                    Keep it safe.
                </p>
                <Button onClick={handleExport}>
                    Download Encrypted Backup
                </Button>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
                    <Upload className="w-5 h-5" /> Restore from Backup
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-4">
                    Restore your journal from a backup file. <span className="font-bold">This will replace current data.</span>
                </p>
                <div className="relative">
                    <input
                        type="file"
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                        id="backup-upload"
                        disabled={importing}
                    />
                    <label htmlFor="backup-upload">
                        <Button as="span" variant="secondary" className="cursor-pointer" disabled={importing}>
                            {importing ? 'Restoring...' : 'Select Backup File'}
                        </Button>
                    </label>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">About Security</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-green-500" />
                        Zero-Knowledge Encryption (AES-GCM)
                    </li>
                    <li className="flex gap-2">
                         <AlertTriangle className="w-4 h-4 text-green-500" />
                        PBKDF2 Key Derivation (100k iterations)
                    </li>
                    <li className="flex gap-2">
                         <AlertTriangle className="w-4 h-4 text-green-500" />
                        Data stored locally in IndexedDB
                    </li>
                </ul>
            </div>
       </div>
    </div>
  );
};
