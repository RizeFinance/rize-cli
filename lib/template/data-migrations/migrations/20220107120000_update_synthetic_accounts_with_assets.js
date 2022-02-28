const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
        ALTER TABLE ${schema}.synthetic_accounts
        ADD COLUMN asset_balances JSONB;
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        ALTER TABLE ${schema}.synthetic_accounts
        DROP COLUMN asset_balances;
    `);
};
