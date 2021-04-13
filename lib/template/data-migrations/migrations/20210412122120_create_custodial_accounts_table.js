const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.custodial_accounts(
            uid VARCHAR(255) NOT NULL,
            external_uid VARCHAR(255) NOT NULL,
            customer_uid VARCHAR(255) NOT NULL,
            pool_uid VARCHAR(255) NOT NULL,
            program_service_offering_uid VARCHAR(255) NULL,
            type VARCHAR(255) NOT NULL,
            liability BOOLEAN NOT NULL,
            name VARCHAR(255) NULL,
            primary_account BOOLEAN NOT NULL,
            status VARCHAR(255) NULL,
            net_usd_balance VARCHAR(255) NOT NULL,
            net_usd_pending_balance VARCHAR(255) NOT NULL,
            net_usd_available_balance VARCHAR(255) NOT NULL,
            account_number_masked VARCHAR(4) NULL,
            routing_number VARCHAR(255) NULL,
            opened_at TIMESTAMP(3) NOT NULL,
            closed_at TIMESTAMP(3) NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.custodial_accounts
        ADD CONSTRAINT PK_custodial_accounts PRIMARY KEY (uid),
        ADD CONSTRAINT FK_custodial_accounts_customer_uid FOREIGN KEY (customer_uid) REFERENCES ${schema}.customers(uid),
        ADD CONSTRAINT FK_custodial_accounts_pool_uid FOREIGN KEY (pool_uid) REFERENCES ${schema}.pools(uid);
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.transaction_events
        ADD CONSTRAINT FK_transaction_events_source_custodial_account_uid FOREIGN KEY (source_custodial_account_uid) REFERENCES ${schema}.custodial_accounts(uid),
        ADD CONSTRAINT FK_transaction_events_destination_custodial_account_uid FOREIGN KEY (destination_custodial_account_uid) REFERENCES ${schema}.custodial_accounts(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.custodial_accounts;
    `);
};
