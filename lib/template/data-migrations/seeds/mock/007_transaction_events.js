const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('transaction_events')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.transaction_events (
                uid,
                settled_index,
                transaction_uid,
                phase,
                source_custodial_account_uid,
                destination_custodial_account_uid,
                status,
                us_dollar_amount,
                type,
                net_asset,
                description,
                created_at,
                settled_at)
            VALUES
                (
                    'transaction_event_001',
                    '1',
                    'transaction_001',
                    '1',
                    'custodial_account_001',
                    'custodial_account_003',
                    'settled',
                    '5.21',
                    'odfi_ach_deposit',
                    'positive',
                    'Transfer from Bank ABC 123 to Rize 999',
                    '${now}',
                    '${now}'
                ),
                (
                    'transaction_event_002',
                    '1',
                    'transaction_001',
                    '1',
                    'custodial_account_001',
                    'custodial_account_003',
                    'settled',
                    '600.03',
                    'odfi_ach_withdrawal',
                    'positive',
                    'Transfer from Bank ABC 123 to Rize 999',
                    '${now}',
                    '${now}'
                ),
                (
                    'transaction_event_003',
                    '1',
                    'transaction_002',
                    '1',
                    'custodial_account_001',
                    'custodial_account_006',
                    'settled',
                    '100.42',
                    'rdfi_ach_deposit',
                    'positive',
                    'Transfer from Bank ABC 123 to Rize 999',
                    '${now}',
                    '${now}'
                ),
                (
                    'transaction_event_004',
                    '1',
                    'transaction_002',
                    '1',
                    'custodial_account_001',
                    'custodial_account_006',
                    'settled',
                    '700.22',
                    'rdfi_ach_withdrawal',
                    'positive',
                    'Transfer from Bank ABC 123 to Rize 999',
                    '${now}',
                    '${now}'
                );
        `);
    }
};
