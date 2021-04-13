const config = require('../config/config');

const schema = config.database.defaultSchema;
const db = config.database.connection.database;
const platform = config.database.client;

exports.up = async (knex) => {
    if(platform !== 'mysql') {
        await knex.raw(`
            CREATE SCHEMA ${schema};

            REVOKE ALL PRIVILEGES ON DATABASE ${db} FROM PUBLIC;
            REVOKE CONNECT ON DATABASE ${db} FROM PUBLIC;
            REVOKE CREATE ON DATABASE ${db} FROM PUBLIC;
            REVOKE CREATE ON SCHEMA PUBLIC FROM PUBLIC;
            REVOKE USAGE ON SCHEMA PUBLIC FROM PUBLIC;
        `);
    }
};

exports.down = async (knex) => {
    if(platform !== 'mysql') {
        await knex.raw(`
            DROP SCHEMA IF EXISTS ${schema} CASCADE;
        `);
    }
};
