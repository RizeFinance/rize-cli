const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.transfers(
            uid VARCHAR(255) NOT NULL,
            external_uid VARCHAR(255) NOT NULL,
            source_synthetic_account_uid VARCHAR(255) NOT NULL,
            destination_synthetic_account_uid VARCHAR(255) NOT NULL,
            initiating_customer_uid VARCHAR(255) NOT NULL,
            usd_transfer_amount VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(3) NOT NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.transfers
        ADD CONSTRAINT PK_transfers PRIMARY KEY (uid),
        ADD CONSTRAINT FK_transfers_source_synthetic_account_uid FOREIGN KEY (source_synthetic_account_uid) REFERENCES ${schema}.synthetic_accounts(uid),
        ADD CONSTRAINT FK_transfers_destination_synthetic_account_uid FOREIGN KEY (destination_synthetic_account_uid) REFERENCES ${schema}.synthetic_accounts(uid),
        ADD CONSTRAINT FK_transfers_initiating_customer_uid FOREIGN KEY (initiating_customer_uid) REFERENCES ${schema}.customers(uid);
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.transactions
        ADD CONSTRAINT FK_transactions_transfer_uid FOREIGN KEY (transfer_uid) REFERENCES ${schema}.transfers(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.transfers;
    `);
};
