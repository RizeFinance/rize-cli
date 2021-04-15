const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('custodial_line_items')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.custodial_line_items (
                uid,
                settled_index,
                transaction_uid,
                transaction_event_uid,
                custodial_account_uid,
                status,
                us_dollar_amount,
                running_us_dollar_balance,
                type,
                description,
                created_at,
                occurred_at,
                settled_at)
            VALUES
                (
                    'custodial_line_item_001',
                    '1',
                    'transaction_001',
                    'transaction_event_001',
                    'custodial_account_001',
                    'settled',
                    '5.21',
                    '34.21',
                    'transaction category 8348',
                    'Deposit from Bank ABC 123',
                    '${now}',
                    '${now}',
                    '${now}'
                ),
                (
                    'custodial_line_item_002',
                    '1',
                    'transaction_002',
                    'transaction_event_002',
                    'custodial_account_002',
                    'settled',
                    '5.21',
                    '34.21',
                    'transaction category 8348',
                    'Deposit from Bank ABC 123',
                    '${now}',
                    '${now}',
                    '${now}'
                ),
                (
                    'custodial_line_item_003',
                    '1',
                    'transaction_001',
                    'transaction_event_003',
                    'custodial_account_003',
                    'settled',
                    '5.21',
                    '34.21',
                    'transaction category 8348',
                    'Deposit from Bank ABC 123',
                    '${now}',
                    '${now}',
                    '${now}'
                ),
                (
                    'custodial_line_item_004',
                    '1',
                    'transaction_002',
                    'transaction_event_004',
                    'custodial_account_004',
                    'settled',
                    '5.21',
                    '34.21',
                    'transaction category 8348',
                    'Deposit from Bank ABC 123',
                    '${now}',
                    '${now}',
                    '${now}'
                ),
                (
                    'custodial_line_item_005',
                    '1',
                    'transaction_001',
                    'transaction_event_001',
                    'custodial_account_005',
                    'settled',
                    '5.21',
                    '34.21',
                    'transaction category 8348',
                    'Deposit from Bank ABC 123',
                    '${now}',
                    '${now}',
                    '${now}'
                ),
                (
                    'custodial_line_item_006',
                    '1',
                    'transaction_002',
                    'transaction_event_002',
                    'custodial_account_006',
                    'settled',
                    '5.21',
                    '34.21',
                    'transaction category 8348',
                    'Deposit from Bank ABC 123',
                    '${now}',
                    '${now}',
                    '${now}'
                );
        `);
    }
};
