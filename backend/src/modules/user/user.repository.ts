import type { Db } from '../../database/connection.js';

export type UserStateRow = {
  id: string;                 // userId
  name: string | null;        // display name (optional)
  lastVerseKey: string;
  lastPageNumber: number;
  totalPages: number;
  targetDays: number;
  startDate: string;          // ISO
  streak: number;
  lastCheckInDate: string | null; // YYYY-MM-DD (UTC) or null
  xp: number;
  updatedAt: string;          // ISO
};

const TABLE = 'user_state';

export const userRepository = {
  async get(db: Db, id: string): Promise<UserStateRow> {
    const row = await db<UserStateRow>(TABLE).where({ id }).first();
    if (!row) throw new Error('State not initialized');
    return row;
  },

  async upsertDefault(db: Db, id: string) {
    const row = await db(TABLE).where({ id }).first();
    if (row) return;

    const now = new Date().toISOString();
    await db(TABLE).insert({
      id,
      name: null,
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

  async update(db: Db, id: string, patch: Partial<UserStateRow>): Promise<UserStateRow> {
    await db(TABLE).where({ id }).update(patch);
    return this.get(db, id);
  },

  async leaderboard(db: Db, limit = 20) {
    const rows = await db<UserStateRow>(TABLE)
      .select(['id','name','streak','xp','lastPageNumber','updatedAt'])
      .orderBy([{ column: 'streak', order: 'desc' }, { column: 'xp', order: 'desc' }, { column: 'updatedAt', order: 'asc' }])
      .limit(limit);

    return rows;
  },
};
