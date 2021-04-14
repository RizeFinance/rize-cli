const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('custodial_accounts')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.custodial_accounts (
                uid,
                external_uid,
                customer_uid,
                pool_uid,
                type,
                liability,
                primary_account,
                net_usd_balance,
                net_usd_pending_balance,
                net_usd_available_balance,
                opened_at)
            VALUES
                (
                    'custodial_account_001',
                    'custodial_account_001_external_uid',
                    'customer_001',
                    'pool_001',
                    'dda',
                    true,
                    true,
                    0,
                    0,
                    0,
                    '${now}'
                ),
                (
                    'custodial_account_002',
                    'custodial_account_002_external_uid',
                    'customer_001',
                    'pool_001',
                    'dda',
                    true,
                    true,
                    0,
                    0,
                    0,
                    '${now}'
                );
        `);
    }
};
