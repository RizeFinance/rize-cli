const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
    CREATE TABLE ${schema}.customers(
        uid VARCHAR(255) NOT NULL,
        rize_uid VARCHAR(255) NOT NULL,
        program_uid VARCHAR(255) NOT NULL,
        pool_uids VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        kyc_status VARCHAR(255) NULL,
        total_balance VARCHAR(255) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL,
        locked_at TIMESTAMP(3) NULL,
        lock_reason VARCHAR(255) NULL,
        first_name VARCHAR(255) NULL,
        middle_name VARCHAR(255) NULL,
        last_name VARCHAR(255) NULL,
        suffix VARCHAR(255) NULL,
        phone VARCHAR(15) NULL,
        dob VARCHAR(10) NULL,
        street1 VARCHAR(255) NULL,
        street2 VARCHAR(255) NULL,
        city VARCHAR(255) NULL,
        state VARCHAR(3) NULL,
        postal_code VARCHAR(10) NULL
    );
`);

    await knex.raw(`
        ALTER TABLE ${schema}.customers
        ADD CONSTRAINT PK_customers PRIMARY KEY (uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.customers;
    `);
};
