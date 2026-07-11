// In-memory TTL cache for provider responses (weather, currency, visa).

type Entry = { value: unknown; expiresAt: number };

const store = new Map<string, Entry>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });

  if (store.size > 5_000) {
    const now = Date.now();
    for (const [k, e] of store) if (e.expiresAt <= now) store.delete(k);
  }
  return value;
}
