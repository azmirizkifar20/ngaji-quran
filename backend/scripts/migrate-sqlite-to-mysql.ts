import knex, { Knex } from 'knex';
import mysql from 'mysql2/promise';

const sourceSqliteFile = process.env.SOURCE_SQLITE_FILE || './dev.db';
const target = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ngaji_quran',
};

async function createDatabaseIfNotExists() {
  const conn = await mysql.createConnection({
    host: target.host,
    port: target.port,
    user: target.user,
    password: target.password,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${target.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

function sqliteDb(): Knex {
  return knex({
    client: 'sqlite3',
    connection: { filename: sourceSqliteFile },
    useNullAsDefault: true,
  });
}

function mysqlDb(): Knex {
  return knex({
    client: 'mysql2',
    connection: {
      host: target.host,
      port: target.port,
      user: target.user,
      password: target.password,
      database: target.database,
      charset: 'utf8mb4',
    },
  });
}

async function copyTable(dbFrom: Knex, dbTo: Knex, table: string, keyColumn: string) {
  const hasSource = await dbFrom.schema.hasTable(table);
  const hasTarget = await dbTo.schema.hasTable(table);

  if (!hasSource) {
    console.log(`- skip ${table} (not found in sqlite)`);
    return;
  }
  if (!hasTarget) {
    throw new Error(`target table ${table} not found in mysql. Run migration first.`);
  }

  const rows = await dbFrom(table).select('*');
  if (!rows.length) {
    console.log(`- ${table}: 0 rows`);
    return;
  }

  await dbTo.transaction(async (trx) => {
    for (const row of rows) {
      // upsert-style for rerunnable import
      await trx(table)
        .insert(row)
        .onConflict(keyColumn)
        .merge();
    }
  });

  console.log(`- ${table}: ${rows.length} rows imported`);
}

async function main() {
  console.log('== sqlite -> mysql import ==');
  console.log(`source sqlite: ${sourceSqliteFile}`);
  console.log(`target mysql : ${target.user}@${target.host}:${target.port}/${target.database}`);

  await createDatabaseIfNotExists();

  const from = sqliteDb();
  const to = mysqlDb();

  try {
    await copyTable(from, to, 'user_state', 'id');
    await copyTable(from, to, 'users', 'id');
    await copyTable(from, to, 'user_sync', 'userId');
    console.log('✅ import selesai');
  } finally {
    await from.destroy();
    await to.destroy();
  }
}

main().catch((err) => {
  console.error('❌ gagal import:', err?.message || err);
  process.exit(1);
});
