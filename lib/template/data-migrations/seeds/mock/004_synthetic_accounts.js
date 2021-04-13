const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('synthetic_accounts')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.synthetic_accounts (
                uid,
                external_uid,
                name,
                pool_uid,
                synthetic_account_type_uid,
                synthetic_account_category,
                status,
                liability,
                net_usd_balance,
                net_usd_pending_balance,
                net_usd_available_balance,
                master_account,
                account_number_last_four,
                routing_number,
                opened_at)
            VALUES
                (
                    'synthetic_account_001',
                    'synthetic_account_001_external_uid',
                    'Primary Asset Account',
                    'pool_001',
                    'synthetic_account_type_01',
                    'general',
                    'active',
                    false,
                    '0',
                    '0',
                    '0',
                    true,
                    '1111',
                    '123456789',
                    '${now}'
                ),
                (
                    'synthetic_account_002',
                    'synthetic_account_002_external_uid',
                    'Primary Account',
                    'pool_001',
                    'synthetic_account_type_01',
                    'general',
                    'active',
                    true,
                    '0',
                    '0',
                    '0',
                    true,
                    '1111',
                    '123456789',
                    '${now}'
                ),
                (
                    'synthetic_account_003',
                    'synthetic_account_003_external_uid',
                    'Secondary Account',
                    'pool_001',
                    'synthetic_account_type_01',
                    'general',
                    'active',
                    true,
                    '0',
                    '0',
                    '0',
                    false,
                    '2222',
                    '123456789',
                    '${now}'
                ),
                (
                    'synthetic_account_004',
                    'synthetic_account_004_external_uid',
                    'External Account',
                    'pool_001',
                    'synthetic_account_type_02',
                    'external',
                    'active',
                    false,
                    NULL,
                    NULL,
                    NULL,
                    false,
                    '3333',
                    '123456789',
                    '${now}'
                ),
                (
                    'synthetic_account_005',
                    'synthetic_account_005_external_uid',
                    'Primary Asset Account',
                    'pool_002',
                    'synthetic_account_type_01',
                    'general',
                    'active',
                    false,
                    '0',
                    '0',
                    '0',
                    true,
                    '4444',
                    '123456789',
                    '${now}'
                ),
                (
                    'synthetic_account_006',
                    'synthetic_account_006_external_uid',
                    'Primary Account',
                    'pool_002',
                    'synthetic_account_type_01',
                    'general',
                    'active',
                    true,
                    '0',
                    '0',
                    '0',
                    true,
                    '4444',
                    '123456789',
                    '${now}'
                );
        `);
    }
};