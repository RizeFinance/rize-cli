const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('transactions')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.transactions (
                uid,
                id,
                source_synthetic_account_uid,
                destination_synthetic_account_uid,
                status,
                us_dollar_amount,
                type,
                net_asset,
                description,
                created_at,
                settled_at)
            VALUES
                (
                    'transaction_001',
                    1,
                    'synthetic_account_002',
                    'synthetic_account_003',
                    'settled',
                    '10.0',
                    'internal_transfer',
                    'positive',
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sit amet pulvinar eros. Nullam et vestibulum lacus. Ut ac metus lectus. Duis imperdiet consequat pellentesque.',
                    '${now}',
                    '${now}'
                ),
                (
                    'transaction_002',
                    2,
                    'synthetic_account_002',
                    'synthetic_account_006',
                    'settled',
                    '20.0',
                    'external_transfer',
                    'positive',
                    'In elit quam, ullamcorper ut libero et, suscipit bibendum justo. Aenean vulputate vestibulum purus eget egestas',
                    '${now}',
                    '${now}'
                ),
                (
                    'transaction_003',
                    1,
                    'synthetic_account_004',
                    'synthetic_account_003',
                    'pending',
                    '30.0',
                    'internal_transfer',
                    'positive',
                    'Nulla ut semper purus, sit amet viverra odio. Curabitur quis nibh nec leo suscipit convallis vel nec mauris. Donec consequat ex vitae accumsan venenatis',
                    '${now}',
                    NULL
                );
        `);
    }
};
