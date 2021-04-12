const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.custodial_account_errors(
            custodial_account_uid VARCHAR(255) NOT NULL,
            error_code VARCHAR(255) NOT NULL,
            error_name VARCHAR(255) NOT NULL,
            error_description VARCHAR(255) NOT NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.custodial_account_errors
        ADD CONSTRAINT FK_custodial_account_errors_custodial_account_uid FOREIGN KEY (custodial_account_uid) REFERENCES ${schema}.custodial_accounts(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.custodial_account_errors;
    `);
};

