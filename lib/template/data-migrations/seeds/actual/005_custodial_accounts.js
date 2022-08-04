const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('custodial_accounts')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const custodial_accounts = await rize.custodialAccount.getList({ limit: 1000 });
        if (custodial_accounts.data.length === 0) return;

        const values = custodial_accounts.data
            .map(x => `(
              '${x.uid}',
              ${x.external_uid ? `'${x.external_uid}'` : null},
              '${x.customer_uid}',
              '${x.pool_uid}',
              ${x.program_service_offering_uid ? `'${x.program_service_offering_uid}'` : null},
              '${x.type}',
              ${x.liability},
              ${x.name ? `'${x.name}'` : null},
              ${x.primary_account},
              ${x.status ? `'${x.status}'` : null},
              '${x.net_usd_balance}',
              '${x.net_usd_pending_balance}',
              '${x.net_usd_available_balance}',
              ${x.account_number_masked ? `'${x.account_number_masked}'` : null },
              ${x.routing_number ? `'${x.routing_number}'` : null },
              ${x.opened_at ? `'${x.opened_at}'` : null},
              ${x.closed_at ? `'${x.closed_at}'` : null }
            )`)
            .join(',');

        return knex.raw(`
            INSERT INTO ${schema}.custodial_accounts (
              uid,
              external_uid,
              customer_uid,
              pool_uid,
              program_service_offering_uid,
              type,
              liability,
              name,
              primary_account,
              status,
              net_usd_balance,
              net_usd_pending_balance,
              net_usd_available_balance,
              account_number_masked,
              routing_number,
              opened_at,
              closed_at) 
            VALUES 
                ${values};
        `);
    }
};
