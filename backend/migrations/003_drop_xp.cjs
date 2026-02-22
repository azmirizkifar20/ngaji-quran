/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const has = await knex.schema.hasTable('user_state');
  if (!has) return;
  const hasXp = await knex.schema.hasColumn('user_state', 'xp');
  if (hasXp) {
    await knex.schema.alterTable('user_state', (t) => {
      t.dropColumn('xp');
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const has = await knex.schema.hasTable('user_state');
  if (!has) return;
  const hasXp = await knex.schema.hasColumn('user_state', 'xp');
  if (!hasXp) {
    await knex.schema.alterTable('user_state', (t) => {
      t.integer('xp').notNullable().defaultTo(0);
    });
  }
};
