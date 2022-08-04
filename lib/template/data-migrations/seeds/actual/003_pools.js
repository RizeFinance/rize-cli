const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('pools')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const pools = await rize.pool.getList({ limit: 1000 });
        if (pools.data.length === 0) return;
        
        const values = pools.data
            .map(x => `('${x.uid}', '${x.name}', '${x.owner_customer_uid}')`)
            .join(',');

        return knex.raw(`
            INSERT INTO ${schema}.pools (uid, name, owner_customer_uid)
            VALUES
                ${values};
        `);
    }
};
