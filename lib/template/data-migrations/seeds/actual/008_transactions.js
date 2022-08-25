const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('transactions')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const transactions = await rize.transaction.getList({ limit: 3000 });
        if (transactions.data.length === 0) return;
        
        const values = transactions.data
            .map(x => `(
                '${x.uid}',
                ${x.id},
                ${x.settled_index || null},
                ${x.transfer_uid ? `'${x.transfer_uid}'` : null },
                '${x.source_synthetic_account_uid}',
                '${x.destination_synthetic_account_uid}',
                '${x.status}',
                '${x.us_dollar_amount}',
                '${x.type}',
                '${x.net_asset}',
                '${x.description.replace(/'/g, '\"')}',
                '${x.created_at}',
                ${x.settled_at ? `'${x.settled_at}'` : null}
            )`)
            .join(',');

        return knex.raw(`
            INSERT INTO ${schema}.transactions (
                uid,
                id,
                settled_index,
                transfer_uid,
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
                ${values};
        `);
    }
};
