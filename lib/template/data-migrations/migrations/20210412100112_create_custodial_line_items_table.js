const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.custodial_line_items(
            uid VARCHAR(255) NOT NULL,
            settled_index INTEGER NOT NULL,
            transaction_uid VARCHAR(255) NOT NULL,
            transaction_event_uid VARCHAR(255) NOT NULL,
            custodial_account_uid VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            us_dollar_amount VARCHAR(255) NOT NULL,
            running_us_dollar_balance VARCHAR(255) NULL,
            type VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(3) NOT NULL,
            occurred_at TIMESTAMP(3) NULL,
            settled_at TIMESTAMP(3) NOT NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.custodial_line_items
        ADD CONSTRAINT PK_custodial_line_items PRIMARY KEY (uid),
        ADD CONSTRAINT FK_custodial_line_items_transaction_uid FOREIGN KEY (transaction_uid) REFERENCES ${schema}.transactions(uid),
        ADD CONSTRAINT FK_custodial_line_items_transaction_event_uid FOREIGN KEY (transaction_event_uid) REFERENCES ${schema}.transaction_events(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.custodial_line_items;
    `);
};
