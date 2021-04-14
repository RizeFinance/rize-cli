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
                    'synthetic_account_001',
                    'synthetic_account_004',
                    'settled',
                    '10.0',
                    'external_transfer',
                    'positive'
                    'description',
                    '${now}',
                    '${now}'
                ),
                (
                    'transaction_002',
                    2,
                    'synthetic_account_002',
                    'synthetic_account_004',
                    'settled',
                    '20.0',
                    'external_transfer',
                    'positive'
                    'description',
                    '${now}',
                    '${now}'
                );
        `);
    }
};
