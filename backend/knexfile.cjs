/** @type {import('knex').Knex.Config} */
const dbClient = process.env.DB_CLIENT || 'sqlite3';

if (dbClient === 'mysql2') {
  module.exports = {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ngaji_quran',
      charset: 'utf8mb4',
    },
    migrations: {
      directory: './migrations',
      extension: 'cjs',
    },
  };
} else {
  module.exports = {
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLITE_FILE || './dev.db',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      extension: 'cjs',
    },
  };
}
