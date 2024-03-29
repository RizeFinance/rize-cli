const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('customers')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const customers = await rize.customer.getList({ limit: 1000 });
        if (customers.data.length === 0) return;
        
        const values = customers.data
            .map(x => `(
                '${x.uid}',
                '${x.external_uid}',
                '${x.program_uid}',
                '${x.email}',
                '${x.status}',
                '${x.kyc_status}',
                '${x.total_balance}',
                ${x.locked_at ? `'${x.locked_at}'` : null},
                ${x.lock_reason ? `'${x.lock_reason}'` : null},
                '${x.created_at}'
            )`)
            .join(',');

        return knex.raw(`
            INSERT INTO ${schema}.customers (
                uid,
                external_uid,
                program_uid,
                email,
                status,
                kyc_status,
                total_balance,
                locked_at,
                lock_reason,
                created_at)
            VALUES
                ${values};
        `);
    }
};
