const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.transaction_events(
            uid VARCHAR(255) NOT NULL,
            settled_index INTEGER NOT NULL,
            transaction_uid VARCHAR(255) NOT NULL,
            phase INTEGER NOT NULL,
            source_custodial_account_uid VARCHAR(255) NOT NULL,
            destination_custodial_account_uid VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            us_dollar_amount VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            net_asset VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(3) NOT NULL,
            settled_at TIMESTAMP(3) NOT NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.transaction_events
        ADD CONSTRAINT PK_transaction_events PRIMARY KEY (uid),
        ADD CONSTRAINT FK_transaction_events_transaction_uid FOREIGN KEY (transaction_uid) REFERENCES ${schema}.transactions(uid),
        ADD CONSTRAINT FK_transaction_events_source_custodial_account_uid FOREIGN KEY (source_custodial_account_uid) REFERENCES ${schema}.custodial_accounts(uid),
        ADD CONSTRAINT FK_transaction_events_destination_custodial_account_uid FOREIGN KEY (destination_custodial_account_uid) REFERENCES ${schema}.custodial_accounts(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.transaction_events;
    `);
};
