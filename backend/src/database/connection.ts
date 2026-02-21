import knex, { Knex } from 'knex';
import { getEnv } from '../config/env.js';

export type Db = Knex;

export function createDb(): Db {
  const env = getEnv();
  return knex({
    client: 'sqlite3',
    connection: { filename: env.SQLITE_FILE },
    useNullAsDefault: true,
    pool: { min: 0, max: 1 }, // sqlite single-writer friendly
  });
}
