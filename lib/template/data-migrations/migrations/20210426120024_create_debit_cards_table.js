const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.debit_cards(
            uid VARCHAR(255) NOT NULL,
            external_uid VARCHAR(255) NOT NULL,
            customer_uid VARCHAR(255) NOT NULL,
            pool_uid VARCHAR(255) NOT NULL,
            synthetic_account_uid VARCHAR(255) NOT NULL,
            custodial_account_uid VARCHAR(255) NOT NULL,
            card_last_four_digit VARCHAR(4) NULL,
            status VARCHAR(255) NOT NULL,
            ready_to_use BOOLEAN NOT NULL,
            lock_reason VARCHAR(255) NULL,
            issued_on TIMESTAMP(3) NULL,
            locked_at TIMESTAMP(3) NULL,
            closed_at TIMESTAMP(3) NULL,
            street1 VARCHAR(255) NULL,
            street2 VARCHAR(255) NULL,
            city VARCHAR(255) NULL,
            state VARCHAR(255) NULL,
            postal_code VARCHAR(10) NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.debit_cards
        ADD CONSTRAINT PK_debit_cards PRIMARY KEY (uid),
        ADD CONSTRAINT FK_debit_cards_customer_uid FOREIGN KEY (customer_uid) REFERENCES ${schema}.customers(uid),
        ADD CONSTRAINT FK_debit_cards_pool_uid FOREIGN KEY (pool_uid) REFERENCES ${schema}.pools(uid),
        ADD CONSTRAINT FK_debit_cards_synthetic_account_uid FOREIGN KEY (synthetic_account_uid) REFERENCES ${schema}.synthetic_accounts(uid),
        ADD CONSTRAINT FK_debit_cards_custodial_account_uid FOREIGN KEY (custodial_account_uid) REFERENCES ${schema}.custodial_accounts(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.debit_cards;
    `);
};
