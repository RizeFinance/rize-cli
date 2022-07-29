exports.up = function (knex) {
  return knex.schema.alterTable('debit_cards', table => {
    table.string('external_uid').nullable().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('debit_cards', table => {
    table.string('external_uid').notNullable().alter();
  });
};
