const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.transactions(
            uid VARCHAR(255) NOT NULL,
            id INTEGER NOT NULL,
            settled_index INTEGER NULL,
            transfer_uid INTEGER NULL,
            source_synthetic_account_uid VARCHAR(255) NOT NULL,
            destination_synthetic_account_uid VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            us_dollar_amount VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            net_asset VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(3) NOT NULL,
            settled_at TIMESTAMP(3) NOT NULL
        );

        ALTER TABLE ${schema}.transactions
        ADD CONSTRAINT PK_transactions PRIMARY KEY (uid),
        ADD CONSTRAINT FK_transactions_source_synthetic_account_uid FOREIGN KEY (source_synthetic_account_uid) REFERENCES ${schema}.synthetic_accounts(uid),
        ADD CONSTRAINT FK_transactions_destination_synthetic_account_uid FOREIGN KEY (destination_synthetic_account_uid) REFERENCES ${schema}.synthetic_accounts(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.transactions;
    `);
};
