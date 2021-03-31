const schema = process.env.DB_DEFAULT_SCHEMA;
const db = process.env.DB_DATABASE;

exports.up = async (knex) => {
    await knex.raw(`
        CREATE SCHEMA ${schema};

        REVOKE ALL PRIVILEGES ON DATABASE ${db} FROM PUBLIC;
        REVOKE CONNECT ON DATABASE ${db} FROM PUBLIC;
        REVOKE CREATE ON DATABASE ${db} FROM PUBLIC;
        REVOKE CREATE ON SCHEMA PUBLIC FROM PUBLIC;
        REVOKE USAGE ON SCHEMA PUBLIC FROM PUBLIC;
    `);
};

exports.down = async (knex) => {
    await knex.raw(`
        DROP SCHEMA IF EXISTS ${schema} CASCADE;
    `);
};
