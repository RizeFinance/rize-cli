const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
    ALTER TABLE ${schema}.transaction_events
    DROP COLUMN phase;
  `);
};

exports.down = async (knex) => {
    await knex.raw(`
    ALTER TABLE ${schema}.transaction_events
    ADD phase INTEGER;
  `);
};
