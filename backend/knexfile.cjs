/** @type {import('knex').Knex.Config} */
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
