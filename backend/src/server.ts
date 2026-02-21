import 'dotenv/config';
import { createDb } from './database/connection';
import { migrateLatest } from './database/migrate';
import { createApp } from './app';
import { getEnv } from './config/env';
import { userRepository } from './modules/user/user.repository';

async function main() {
  const env = getEnv();
  const db = createDb();

  // Migrate DB to latest
  await migrateLatest(db);

  // Ensure default row exists (single-user local state)
  await userRepository.upsertDefault(db);

  const app = createApp(db);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`✅ Backend (Enterprise: routes/controllers/services) running on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start', e);
  process.exit(1);
});
