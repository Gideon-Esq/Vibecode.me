import Dexie, { type Table } from 'dexie';

export interface EncryptedEntry {
  id?: number;
  titleData: ArrayBuffer;
  titleIv: Uint8Array;
  bodyData: ArrayBuffer;
  bodyIv: Uint8Array;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetaRecord {
  key: string;
  value: any;
}

class VaultDatabase extends Dexie {
  entries!: Table<EncryptedEntry, number>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('VaultJournalDB');
    this.version(1).stores({
      entries: '++id, createdAt, updatedAt',
      meta: 'key'
    });
  }
}

export const db = new VaultDatabase();

export class StorageService {
  static async getSalt(): Promise<Uint8Array | null> {
    const record = await db.meta.get('salt');
    return record ? record.value : null;
  }

  static async setSalt(salt: Uint8Array): Promise<void> {
    await db.meta.put({ key: 'salt', value: salt });
  }

  static async hasSalt(): Promise<boolean> {
    const count = await db.meta.where('key').equals('salt').count();
    return count > 0;
  }

  static async addEntry(entry: EncryptedEntry): Promise<number> {
    return await db.entries.add(entry);
  }

  static async updateEntry(id: number, entry: Partial<EncryptedEntry>): Promise<number> {
    return await db.entries.update(id, { ...entry, updatedAt: new Date() });
  }

  static async getEntries(): Promise<EncryptedEntry[]> {
    return await db.entries.orderBy('createdAt').reverse().toArray();
  }

  static async getEntry(id: number): Promise<EncryptedEntry | undefined> {
    return await db.entries.get(id);
  }

  static async deleteEntry(id: number): Promise<void> {
    await db.entries.delete(id);
  }

  static async clearAll(): Promise<void> {
    await db.delete();
    await db.open();
  }

  // Backup data structure
  // We convert ArrayBuffers to Arrays (or Base64) for JSON serialization
  static async exportData(): Promise<string> {
    const entries = await db.entries.toArray();
    const salt = await this.getSalt();

    if (!salt) throw new Error("No salt found");

    const exportObject = {
      salt: Array.from(salt),
      entries: entries.map(e => ({
        id: e.id,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        titleData: Array.from(new Uint8Array(e.titleData)),
        titleIv: Array.from(e.titleIv),
        bodyData: Array.from(new Uint8Array(e.bodyData)),
        bodyIv: Array.from(e.bodyIv),
      }))
    };

    return JSON.stringify(exportObject, null, 2);
  }

  static async importData(jsonString: string): Promise<void> {
      try {
          const data = JSON.parse(jsonString);

          if (!data.salt || !Array.isArray(data.entries)) {
              throw new Error("Invalid backup file format");
          }

          // Clear current DB? Or merge?
          // For disaster recovery, usually we restore state.
          // Let's clear to avoid conflicts or duplicates with same IDs but different content?
          // Or just add new ones.
          // Safest is to wipe and restore if it's a full backup.

          await this.clearAll();

          await this.setSalt(new Uint8Array(data.salt));

          const entries: EncryptedEntry[] = data.entries.map((e: any) => ({
              // We let ID be auto-generated or keep it?
              // If we keep it, we might conflict if we didn't clear.
              // Since we cleared, we can keep it or let it regen.
              // To preserve history, let's try to keep it but Dexie auto-increment handles it if we provide it.
              // However, if we move between devices, IDs might not matter as much as content.
              // Let's drop ID to be safe and just re-add, preserving dates.
              createdAt: new Date(e.createdAt),
              updatedAt: new Date(e.updatedAt),
              titleData: new Uint8Array(e.titleData).buffer,
              titleIv: new Uint8Array(e.titleIv),
              bodyData: new Uint8Array(e.bodyData).buffer,
              bodyIv: new Uint8Array(e.bodyIv)
          }));

          await db.entries.bulkAdd(entries);

      } catch (e) {
          console.error("Import failed", e);
          throw new Error("Import failed: " + (e instanceof Error ? e.message : String(e)));
      }
  }
}
