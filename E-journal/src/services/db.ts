import Dexie, { Table } from 'dexie';

export interface Entry {
  id: string;
  date: string; // ISO String
  year: number;
  month: number;
  day: number;

  // Encrypted Content
  titleCipher: string;
  titleIv: string;
  bodyCipher: string;
  bodyIv: string;

  createdAt: number;
  updatedAt: number;
}

export interface EncryptionMeta {
  id: string; // 'master'
  salt: string; // Hex string of salt used for KEK derivation
  encryptedDEK: string; // Base64 ciphertext of the DEK
  dekIv: string; // Base64 IV used to encrypt the DEK
}

export class AuraDB extends Dexie {
  entries!: Table<Entry>;
  meta!: Table<EncryptionMeta>;

  constructor() {
    super('AuraJournalDB');
    this.version(1).stores({
      entries: 'id, date, [year+month+day], year, month', // Indexes for timeline
      meta: 'id'
    });
  }
}

export const db = new AuraDB();
