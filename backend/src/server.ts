import 'dotenv/config';
import { createDb } from './database/connection.js';
import { migrateLatest } from './database/migrate.js';
import { createApp } from './app.js';
import { getEnv } from './config/env.js';
import { userRepository } from './modules/user/user.repository.js';

async function main() {
  const env = getEnv();
  const db = createDb();

  // Migrate DB to latest
  await migrateLatest(db);

  // Ensure default row exists (single-user local state)
  await userRepository.upsertDefault(db, 'local');

  const app = createApp(db);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`âœ… Backend (Enterprise: routes/controllers/services) running on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('âŒ Failed to start', e);
  process.exit(1);
});
