const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('synthetic_accounts')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const synthetic_accounts = await rize.syntheticAccount.getList({ limit: 1000 });
        if (synthetic_accounts.data.length === 0) return;
        
        const values = synthetic_accounts.data
            .map(x => `(
              '${x.uid}',
              ${x.external_uid ? `'${x.external_uid}'` : null},
              '${x.customer_uid}',
              '${x.name}',
              '${x.pool_uid}',
              '${x.synthetic_account_type_uid}',
              '${x.synthetic_account_category}',
              '${x.status}',
              '${x.liability}',
              ${x.net_usd_balance ? `'${x.net_usd_balance}'` : null },
              ${x.net_usd_pending_balance ? `'${x.net_usd_pending_balance}'` : null },
              ${x.net_usd_available_balance ? `'${x.net_usd_available_balance}'` : null },
              '${x.master_account}',
              ${x.account_number ? `'${x.account_number}'` : null },
              ${x.account_number_last_four ? `'${x.account_number_last_four}'` : null },
              ${x.routing_number ? `'${x.routing_number}'` : null },
              '${x.opened_at}',
              ${x.closed_at ? `'${x.closed_at}'` : null },
              '${x.closed_to_synthetic_account_uid}'
            )`)
            .join(',');

        return knex.raw(`
            INSERT INTO ${schema}.synthetic_accounts (
                uid,
                external_uid,
                customer_uid,
                name,
                pool_uid,
                synthetic_account_type_uid,
                synthetic_account_category,
                status,
                liability,
                net_usd_balance,
                net_usd_pending_balance,
                net_usd_available_balance,
                master_account,
                account_number,
                account_number_last_four,
                routing_number,
                opened_at,
                closed_at,
                closed_to_synthetic_account_uid)
            VALUES
                ${values};
        `);
    }
};
