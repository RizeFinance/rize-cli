const { database: { defaultSchema: schema } } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('debit_cards')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {

        return knex.raw(`
            INSERT INTO ${schema}.debit_cards (
                uid,
                external_uid,
                customer_uid,
                pool_uid,
                synthetic_account_uid,
                custodial_account_uid,
                status,
                ready_to_use)
            VALUES
                (
                    'debit_card_001',
                    'debit_card_001_external_uid',
                    'customer_001',
                    'pool_001',
                    'synthetic_account_002',
                    'custodial_account_002',
                    'queued',
                    true
                ),
                (
                    'debit_card_002',
                    'debit_card_002_external_uid',
                    'customer_002',
                    'pool_002',
                    'synthetic_account_006',
                    'custodial_account_006',
                    'queued',
                    true
                );
        `);
    }
};
