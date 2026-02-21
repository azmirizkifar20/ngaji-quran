import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Db } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrateLatest(db: Db) {
  // migrations are CJS (.cjs) to avoid TS/ESM runtime friction on Windows
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  await db.migrate.latest({
    directory: migrationsDir,
    loadExtensions: ['.cjs'],
  });
}
