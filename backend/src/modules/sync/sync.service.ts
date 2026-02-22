import type { Db } from '../../database/connection.js';
import { syncRepository } from './sync.repository.js';

export const syncService = {
  async get(db: Db, userId: string) {
    const row = await syncRepository.get(db, userId);
    if (!row) return { data: null as any, updatedAt: null as string | null };
    try {
      return { data: JSON.parse(row.data), updatedAt: row.updatedAt };
    } catch {
      return { data: null as any, updatedAt: row.updatedAt };
    }
  },

  async set(db: Db, userId: string, data: unknown) {
    const now = new Date().toISOString();
    await syncRepository.upsert(db, { userId, data: JSON.stringify(data ?? {}), updatedAt: now });
    return { updatedAt: now };
  },
};
