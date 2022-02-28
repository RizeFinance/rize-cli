const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('synthetic_account_types')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();
        
        const syntheticAccountTypes = await rize.syntheticAccount.getTypesList();
        const values = syntheticAccountTypes.data
            .map(x => `('${x.uid}', '${x.name}', '${x.synthetic_account_category}', '${x.description.replace('\'', '\'\'')}', '${x.program_uid}')`)
            .join(',');

        return knex.raw(`
            INSERT INTO ${schema}.synthetic_account_types (uid, name, synthetic_account_category, description, program_uid)
            VALUES
                ${values};
        `);
    }
};