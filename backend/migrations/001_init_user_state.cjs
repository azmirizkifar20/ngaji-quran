/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const has = await knex.schema.hasTable('user_state');
  if (has) return;

  await knex.schema.createTable('user_state', (t) => {
    t.string('id').primary(); // "local"
    t.string('lastVerseKey').notNullable().defaultTo('1:1');
    t.integer('lastPageNumber').notNullable().defaultTo(1);
    t.integer('totalPages').notNullable().defaultTo(604);

    t.integer('targetDays').notNullable().defaultTo(30);
    t.string('startDate').notNullable(); // ISO string

    t.integer('streak').notNullable().defaultTo(0);
    t.string('lastCheckInDate').nullable(); // YYYY-MM-DD (UTC)

    t.string('updatedAt').notNullable(); // ISO string
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('user_state');
};
