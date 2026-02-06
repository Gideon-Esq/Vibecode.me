// Journal Entry Types
export interface JournalEntry {
  id?: number;
  content: string;
  encryptedContent: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

export interface DecryptedEntry {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

// Settings Types
export type FontTheme = 'handwriting' | 'handwriting-alt' | 'serif' | 'sans';

export interface UserSettings {
  id?: number;
  fontTheme: FontTheme;
  darkMode: boolean;
  autoSaveInterval: number; // in milliseconds
}

// Crypto Types
export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface DerivedKeyData {
  key: CryptoKey;
  salt: Uint8Array;
}

// Timeline Types
export interface TimelineGroup {
  year: number;
  months: MonthGroup[];
}

export interface MonthGroup {
  month: number;
  monthName: string;
  days: DayGroup[];
}

export interface DayGroup {
  day: number;
  date: Date;
  entries: DecryptedEntry[];
}

// Backup Types
export interface EncryptedBackup {
  version: string;
  createdAt: string;
  entries: EncryptedData[];
  settings: UserSettings;
  checksum: string;
}

// App State Types
export type AppState = 'locked' | 'unlocked' | 'setup';
