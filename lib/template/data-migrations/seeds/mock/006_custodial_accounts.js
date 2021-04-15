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
                program_service_offering_uid,
                type,
                liability,
                name,
                primary_account,
                status,
                net_usd_balance,
                net_usd_pending_balance,
                net_usd_available_balance,
                account_number_masked,
                routing_number,
                opened_at)
            VALUES
                (
                    'custodial_account_001',
                    'custodial_account_001_external_uid',
                    'customer_001',
                    'pool_001',
                    'program_service_offering_uid_001',
                    'dda_holding',
                    true,
                    'Mock Holding Account',
                    false,
                    'active',
                    '0',
                    '0',
                    '0',
                    '1111',
                    '123456789',
                    '${now}'
                ),
                (
                    'custodial_account_002',
                    'custodial_account_002_external_uid',
                    'customer_001',
                    'pool_001',
                    NULL,
                    'dda_cash_received',
                    false,
                    NULL,
                    false,
                    NULL,
                    '0',
                    '0',
                    '0',
                    NULL,
                    NULL,
                    '${now}'
                ),
                (
                    'custodial_account_003',
                    'custodial_account_003_external_uid',
                    'customer_001',
                    'pool_001',
                    'program_service_offering_uid_001',
                    'dda',
                    true,
                    'Mock Checking Account',
                    true,
                    'active',
                    '0',
                    '0',
                    '0',
                    '1234',
                    '123456789',
                    '${now}'
                ),
                (
                    'custodial_account_004',
                    'custodial_account_004_external_uid',
                    'customer_002',
                    'pool_002',
                    'program_service_offering_uid_001',
                    'dda_holding',
                    true,
                    'Mock Holding Account',
                    false,
                    'active',
                    '0',
                    '0',
                    '0',
                    '4444',
                    '123456789',
                    '${now}'
                ),
                (
                    'custodial_account_005',
                    'custodial_account_005_external_uid',
                    'customer_002',
                    'pool_002',
                    NULL,
                    'dda_cash_received',
                    false,
                    NULL,
                    false,
                    NULL,
                    '0',
                    '0',
                    '0',
                    NULL,
                    NULL,
                    '${now}'
                ),
                (
                    'custodial_account_006',
                    'custodial_account_006_external_uid',
                    'customer_002',
                    'pool_002',
                    'program_service_offering_uid_001',
                    'dda',
                    true,
                    'Mock Checking Account',
                    true,
                    'active',
                    '0',
                    '0',
                    '0',
                    '2345',
                    '123456789',
                    '${now}'
                );
        `);
    }
};
