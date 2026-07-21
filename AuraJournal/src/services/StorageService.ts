/**
 * StorageService - Local-First Storage using Dexie.js (IndexedDB wrapper)
 * 
 * Schema:
 * - entries: Encrypted journal entries
 * - settings: User preferences (font theme, dark mode, etc.)
 * - vault: Password validation data (never stores the actual password)
 */

import Dexie, { type Table } from 'dexie';
import type { UserSettings } from '../types';

export interface VaultData {
  id?: number;
  passwordHash: string;
  validatorCiphertext: string;
  validatorIv: string;
  validatorSalt: string;
  createdAt: Date;
}

export interface StoredEntry {
  id?: number;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

class AuraJournalDB extends Dexie {
  entries!: Table<StoredEntry>;
  settings!: Table<UserSettings>;
  vault!: Table<VaultData>;

  constructor() {
    super('AuraJournalDB');
    
    this.version(1).stores({
      entries: '++id, createdAt, updatedAt',
      settings: '++id',
      vault: '++id'
    });
  }
}

const db = new AuraJournalDB();

// Entry Operations
export async function saveEntry(entry: StoredEntry): Promise<number> {
  if (entry.id) {
    await db.entries.update(entry.id, {
      ...entry,
      updatedAt: new Date()
    });
    return entry.id;
  }
  return await db.entries.add({
    ...entry,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function getEntry(id: number): Promise<StoredEntry | undefined> {
  return await db.entries.get(id);
}

export async function getAllEntries(): Promise<StoredEntry[]> {
  return await db.entries.orderBy('createdAt').reverse().toArray();
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id);
}

export async function countEntries(): Promise<number> {
  return await db.entries.count();
}

// Settings Operations
export async function getSettings(): Promise<UserSettings | undefined> {
  const settings = await db.settings.toArray();
  return settings[0];
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const existing = await db.settings.toArray();
  if (existing.length > 0 && existing[0].id) {
    await db.settings.update(existing[0].id, settings);
  } else {
    await db.settings.add(settings);
  }
}

export async function getDefaultSettings(): Promise<UserSettings> {
  return {
    fontTheme: 'serif',
    darkMode: false,
    autoSaveInterval: 3000
  };
}

// Vault Operations (Password Management)
export async function getVault(): Promise<VaultData | undefined> {
  const vault = await db.vault.toArray();
  return vault[0];
}

export async function saveVault(data: VaultData): Promise<void> {
  const existing = await db.vault.toArray();
  if (existing.length > 0 && existing[0].id) {
    await db.vault.update(existing[0].id, data);
  } else {
    await db.vault.add({
      ...data,
      createdAt: new Date()
    });
  }
}

export async function hasVault(): Promise<boolean> {
  const count = await db.vault.count();
  return count > 0;
}

export async function clearVault(): Promise<void> {
  await db.vault.clear();
}

// Backup & Export Operations
export async function exportAllData(): Promise<{
  entries: StoredEntry[];
  settings: UserSettings | undefined;
}> {
  const entries = await getAllEntries();
  const settings = await getSettings();
  return { entries, settings };
}

export async function importEntries(entries: StoredEntry[]): Promise<void> {
  await db.entries.bulkAdd(entries);
}

// Database Utilities
export async function clearAllData(): Promise<void> {
  await db.entries.clear();
  await db.settings.clear();
  await db.vault.clear();
}

export { db };
