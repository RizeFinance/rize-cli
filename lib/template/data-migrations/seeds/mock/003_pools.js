const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('pools')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        return knex.raw(`
            INSERT INTO ${schema}.pools (uid, name, owner_customer_uid)
            VALUES
                ('pool_001', 'mock pool 001', 'customer_001');
        `);
    }
};