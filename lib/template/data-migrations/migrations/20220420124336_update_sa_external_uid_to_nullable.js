exports.up = function (knex) {
  return knex.schema.alterTable('synthetic_accounts', table => {
    table.string('external_uid').nullable().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('synthetic_accounts', table => {
    table.string('external_uid').notNullable().alter();
  });
};