const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
        ALTER TABLE ${schema}.synthetic_line_items
            ADD COLUMN running_asset_balance VARCHAR(255),
            ADD COLUMN asset_quantity VARCHAR(255),
            ADD COLUMN asset_type VARCHAR(255),
            ADD COLUMN asset_unit_price VARCHAR(255);
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.custodial_line_items
            ADD COLUMN running_asset_balance VARCHAR(255),
            ADD COLUMN asset_quantity VARCHAR(255),
            ADD COLUMN asset_type VARCHAR(255),
            ADD COLUMN asset_unit_price VARCHAR(255);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        ALTER TABLE ${schema}.synthetic_line_items
        DROP COLUMN
            running_asset_balance,
            asset_quantity,
            asset_type,
            asset_unit_price;
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.custodial_line_items
        DROP COLUMN
            running_asset_balance,
            asset_quantity,
            asset_type,
            asset_unit_price;
    `);
};
