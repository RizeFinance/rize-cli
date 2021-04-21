const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('transfers')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const now = (new Date()).toISOString();

        return knex.raw(`
            INSERT INTO ${schema}.transfers (
                uid,
                external_uid,
                source_synthetic_account_uid,
                destination_synthetic_account_uid,
                initiating_customer_uid,
                usd_transfer_amount,
                status,
                created_at)
            VALUES
                (
                    'transfer_001',
                    'transfer_001_external_uid',
                    'synthetic_account_002',
                    'synthetic_account_004',
                    'customer_001',
                    '10.00',
                    'settled',
                    '${now}'
                ),
                (
                    'transfer_002',
                    'transfer_002_external_uid',
                    'synthetic_account_002',
                    'synthetic_account_006',
                    'customer_001',
                    '20.00',
                    'settled',
                    '${now}'
                ),
                (
                    'transfer_003',
                    'transfer_003_external_uid',
                    'synthetic_account_006',
                    'synthetic_account_003',
                    'customer_002',
                    '30.00',
                    'pending',
                    '${now}'
                ),
                (
                    'transfer_004',
                    'transfer_004_external_uid',
                    'synthetic_account_006',
                    'synthetic_account_004',
                    'customer_002',
                    '40.00',
                    'queued',
                    '${now}'
                );
        `);
    }
};
