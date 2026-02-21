/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const has = await knex.schema.hasTable('user_state');
  if (!has) return;

  const hasName = await knex.schema.hasColumn('user_state', 'name');
  if (!hasName) {
    await knex.schema.alterTable('user_state', (t) => {
      t.string('name').nullable();
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const has = await knex.schema.hasTable('user_state');
  if (!has) return;
  const hasName = await knex.schema.hasColumn('user_state', 'name');
  if (hasName) {
    await knex.schema.alterTable('user_state', (t) => {
      t.dropColumn('name');
    });
  }
};
