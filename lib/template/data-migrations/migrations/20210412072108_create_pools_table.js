const schema = process.env.DB_DEFAULT_SCHEMA;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE TABLE ${schema}.pools(
            uid VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            owner_customer_uid VARCHAR(255) NOT NULL
        );
    `);

    await knex.raw(`
        ALTER TABLE ${schema}.pools
        ADD CONSTRAINT PK_pools PRIMARY KEY (uid),
        ADD CONSTRAINT FK_pools_owner_customer_uid FOREIGN KEY (owner_customer_uid) REFERENCES ${schema}.customers(uid);
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP TABLE IF EXISTS ${schema}.pools;
    `);
};
