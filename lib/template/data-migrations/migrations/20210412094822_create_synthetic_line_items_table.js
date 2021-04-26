const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.synthetic_line_items(
            uid VARCHAR(255) NOT NULL,
            settled_index INTEGER NOT NULL,
            transaction_uid VARCHAR(255) NOT NULL,
            synthetic_account_uid VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            us_dollar_amount VARCHAR(255) NOT NULL,
            running_us_dollar_balance VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(3) NOT NULL,
            settled_at TIMESTAMP(3) NOT NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.synthetic_line_items
        ADD CONSTRAINT PK_synthetic_line_items PRIMARY KEY (uid),
        ADD CONSTRAINT FK_synthetic_line_items_transaction_uid FOREIGN KEY (transaction_uid) REFERENCES ${schema}.transactions(uid),
        ADD CONSTRAINT FK_synthetic_line_items_synthetic_account_uid FOREIGN KEY (synthetic_account_uid) REFERENCES ${schema}.synthetic_accounts(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.synthetic_line_items;
    `);
};
