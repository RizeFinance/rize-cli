const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
    CREATE TABLE ${schema}.rize_users(
        uid VARCHAR(255) NOT NULL,
        external_uid VARCHAR(255) NOT NULL,
        program_uid VARCHAR(255) NOT NULL,
        pool_uids VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        kyc_status VARCHAR(255) NOT NULL,
        total_balance VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL default current_timestamp,
        locked_at TIMESTAMP not null,
        lock_reason VARCHAR(255) NOT NULL,
        first_name varchar(255) NOT NULL,
        middle_name varchar(255) NULL,
        last_name varchar(255) NOT NULL,
        suffix varchar(255) NULL,
        phone varchar(255) NOT NULL,
        dob varchar(255) NOT NULL
        street1 varchar(255) NOT NULL,
        street2 varchar(255) NOT NULL,
        city varchar(255) NOT NULL,
        state varchar(255) NOT NULL,
        postal_code varchar(255) NOT NULL
    );

    ALTER TABLE ${schema}.rize_users
    ADD CONSTRAINT PK_rize_users PRIMARY KEY (uid);
`);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.rize_users;
    `);
};
