import type { Db } from '../../database/connection.js';

export type SyncRow = {
  userId: string;
  data: string;
  updatedAt: string;
};

const TABLE = 'user_sync';

export const syncRepository = {
  async get(db: Db, userId: string): Promise<SyncRow | undefined> {
    return db<SyncRow>(TABLE).where({ userId }).first();
  },

  async upsert(db: Db, row: SyncRow) {
    const existing = await db<SyncRow>(TABLE).where({ userId: row.userId }).first();
    if (existing) {
      await db<SyncRow>(TABLE).where({ userId: row.userId }).update(row);
    } else {
      await db<SyncRow>(TABLE).insert(row);
    }
  },
};
