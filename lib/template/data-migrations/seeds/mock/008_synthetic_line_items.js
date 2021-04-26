const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('synthetic_line_items')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.synthetic_line_items (
                uid,
                settled_index,
                transaction_uid,
                synthetic_account_uid,
                status,
                us_dollar_amount,
                running_us_dollar_balance,
                description,
                created_at,
                settled_at)
            VALUES
                (
                    'synthetic_line_item_001',
                    1,
                    'transaction_001',
                    'synthetic_account_002',
                    'settled',
                    '10.0',
                    '10.00',
                    'Test synthetic line item',
                    '${now}',
                    '${now}'
                ),
                (
                    'synthetic_line_item_002',
                    1,
                    'transaction_001',
                    'synthetic_account_003',
                    'settled',
                    '20.0',
                    '20.00',
                    'Test synthetic line item',
                    '${now}',
                    '${now}'
                ),
                (
                    'synthetic_line_item_003',
                    1,
                    'transaction_002',
                    'synthetic_account_002',
                    'settled',
                    '30.0',
                    '30.00',
                    'Test synthetic line item',
                    '${now}',
                    '${now}'
                ),
                (
                    'synthetic_line_item_004',
                    1,
                    'transaction_002',
                    'synthetic_account_006',
                    'settled',
                    '40.0',
                    '40.00',
                    'Test synthetic line item',
                    '${now}',
                    '${now}'
                );
        `);
    }
};
