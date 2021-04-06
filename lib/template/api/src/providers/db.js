const knex = require('knex');

module.exports = function DbProvider(databaseConfig) {
    return knex(databaseConfig);
};
