const { database: { defaultSchema: schema } } = require('../config/config');

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.synthetic_accounts(
            uid VARCHAR(255) NOT NULL,
            external_uid VARCHAR(255) NOT NULL,
            customer_uid VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            pool_uid VARCHAR(255) NOT NULL,
            synthetic_account_type_uid VARCHAR(255) NOT NULL,
            synthetic_account_category VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            liability BOOLEAN NOT NULL,
            net_usd_balance VARCHAR(255) NULL,
            net_usd_pending_balance VARCHAR(255) NULL,
            net_usd_available_balance VARCHAR(255) NULL,
            master_account BOOLEAN NOT NULL,
            account_number VARCHAR(255) NULL,
            account_number_last_four VARCHAR(4) NULL,
            routing_number VARCHAR(255) NULL,
            opened_at TIMESTAMP(3) NOT NULL,
            closed_at TIMESTAMP(3) NULL,
            closed_to_synthetic_account_uid VARCHAR(255) NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.synthetic_accounts
        ADD CONSTRAINT PK_synthetic_accounts PRIMARY KEY (uid),
        ADD CONSTRAINT FK_customer_uid FOREIGN KEY (customer_uid) REFERENCES ${schema}.customers(uid),
        ADD CONSTRAINT FK_synthetic_accounts_pool_uid FOREIGN KEY (pool_uid) REFERENCES ${schema}.pools(uid),
        ADD CONSTRAINT FK_synthetic_accounts_synthetic_account_type_uid FOREIGN KEY (synthetic_account_type_uid) REFERENCES ${schema}.synthetic_account_types(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.synthetic_accounts;
    `);
};
