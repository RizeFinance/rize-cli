const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('transfers')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const transfers = await rize.transfer.getList({ limit: 3000 });
        if (transfers.data.length === 0) return;
        
        const values = transfers.data
            .map(x => `(
                '${x.uid}',
                '${x.external_uid}',
                '${x.source_synthetic_account_uid}',
                '${x.destination_synthetic_account_uid}',
                '${x.initiating_customer_uid}',
                '${x.usd_transfer_amount}',
                '${x.status}',
                '${x.created_at}'
            )`)
            .join(',');

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
                ${values};
        `);
    }
};
