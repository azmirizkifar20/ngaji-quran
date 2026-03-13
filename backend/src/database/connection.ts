import knex, { Knex } from 'knex';
import { getEnv } from '../config/env.js';

export type Db = Knex;

export function createDb(): Db {
  const env = getEnv();

  if (env.DB_CLIENT === 'mysql2') {
    return knex({
      client: 'mysql2',
      connection: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        charset: 'utf8mb4',
      },
      pool: { min: 0, max: 10 },
    });
  }

  return knex({
    client: 'sqlite3',
    connection: { filename: env.SQLITE_FILE },
    useNullAsDefault: true,
    pool: { min: 0, max: 1 }, // sqlite single-writer friendly
  });
}
