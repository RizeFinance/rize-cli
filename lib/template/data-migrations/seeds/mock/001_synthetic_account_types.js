const { database: { defaultSchema: schema }, rize } = require('../../config/config');

exports.seed = async function (knex) {
    const count = await knex('synthetic_account_types')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        return knex.raw(`
            INSERT INTO ${schema}.synthetic_account_types (uid, name, synthetic_account_category, description, program_uid)
            VALUES
                ('synthetic_account_type_01', 'general', 'general', '(Mock) General use synthetic_account', '${rize.programId}'),
                ('synthetic_account_type_02', 'external', 'external account', '(Mock) external account type', '${rize.programId}'),
                ('synthetic_account_type_03', 'plaid_external', 'plaid external account', '(Mock) plaid external account type', '${rize.programId}');
        `);
    }
};