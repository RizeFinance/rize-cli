const {
  database: { defaultSchema: schema },
} = require("../config/config");

exports.up = async (knex) => {
  await knex.raw(`
        ALTER TABLE ${schema}.customers
            ADD COLUMN type VARCHAR(255),
            ADD COLUMN business_name VARCHAR(255);
    `);
};

exports.down = async (knex) => {
  await knex.raw(`
        ALTER TABLE ${schema}.customers
        DROP COLUMN
            type,
            business_name;
    `);
};
