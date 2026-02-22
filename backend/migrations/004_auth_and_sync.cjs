/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (t) => {
      t.string('id').primary();
      t.string('email').notNullable().unique();
      t.string('passwordHash').notNullable();
      t.string('createdAt').notNullable();
      t.string('updatedAt').notNullable();
    });
  }

  const hasSync = await knex.schema.hasTable('user_sync');
  if (!hasSync) {
    await knex.schema.createTable('user_sync', (t) => {
      t.string('userId').primary();
      t.text('data').notNullable();
      t.string('updatedAt').notNullable();
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('user_sync');
  await knex.schema.dropTableIfExists('users');
};
