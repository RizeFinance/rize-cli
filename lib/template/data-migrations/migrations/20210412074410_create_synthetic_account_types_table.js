const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.synthetic_account_types(
            uid VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            synthetic_account_category VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            program_uid VARCHAR(255) NOT NULL
        );

        ALTER TABLE ${schema}.synthetic_account_types
        ADD CONSTRAINT PK_synthetic_account_types PRIMARY KEY (uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.synthetic_account_types;
    `);
};
