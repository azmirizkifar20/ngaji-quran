import type { Db } from '../../database/connection';

export type UserStateRow = {
  id: string;
  lastVerseKey: string;
  lastPageNumber: number;
  totalPages: number;
  targetDays: number;
  startDate: string;        // ISO
  streak: number;
  lastCheckInDate: string | null; // YYYY-MM-DD (UTC) or null
  xp: number;
  updatedAt: string;        // ISO
};

const TABLE = 'user_state';
const ID = 'local';

export const userRepository = {
  async get(db: Db): Promise<UserStateRow> {
    const row = await db<UserStateRow>(TABLE).where({ id: ID }).first();
    if (!row) throw new Error('State not initialized');
    return row;
  },

  async upsertDefault(db: Db) {
    const row = await db(TABLE).where({ id: ID }).first();
    if (row) return;

    const now = new Date().toISOString();
    await db(TABLE).insert({
      id: ID,
      lastVerseKey: '1:1',
      lastPageNumber: 1,
      totalPages: 604,
      targetDays: 30,
      startDate: now,
      streak: 0,
      lastCheckInDate: null,
      xp: 0,
      updatedAt: now,
    });
  },

  async update(db: Db, patch: Partial<UserStateRow>): Promise<UserStateRow> {
    await db(TABLE).where({ id: ID }).update(patch);
    return this.get(db);
  },
};
