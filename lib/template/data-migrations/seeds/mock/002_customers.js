const { database: { defaultSchema: schema }, rize } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('customers')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        return knex.raw(`
            INSERT INTO ${schema}.customers (
                uid,
                external_uid,
                program_uid,
                email,
                status,
                total_balance,
                created_at)
            VALUES
                (
                    'customer_001',
                    'auth0|606aae227b51d3006935ba89',
                    '${rize.programId}',
                    'mockaccount_001@rizetest.com',
                    'active',
                    '0',
                    '${(new Date()).toISOString()}'
                ),
                (
                    'customer_002',
                    'auth0|606ae1eb3ead460069c18aab',
                    '${rize.programId}',
                    'mockaccount_002@rizetest.com',
                    'active',
                    '0',
                    '${(new Date()).toISOString()}'
                );
        `);
    }
};