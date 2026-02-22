import type { Db } from '../../database/connection.js';

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

const TABLE = 'users';

export const authRepository = {
  async getByEmail(db: Db, email: string): Promise<UserRow | undefined> {
    return db<UserRow>(TABLE).where({ email }).first();
  },

  async getById(db: Db, id: string): Promise<UserRow | undefined> {
    return db<UserRow>(TABLE).where({ id }).first();
  },

  async create(db: Db, row: UserRow) {
    await db<UserRow>(TABLE).insert(row);
  },
};
