const { database: { defaultSchema: schema } } = require('../../config/config');
const RizeClient = require('../../utils/rizeClient');

exports.seed = async function (knex) {
    const count = await knex('debit_cards')
        .withSchema(schema)
        .count('uid', { as: 'count' });

    if (count[0].count === 0 || count[0].count === '0') {
        const rize = RizeClient.getInstance();

        const debit_cards = await rize.debitCard.getList({ limit: 1000 });
        const values = debit_cards.data.filter(c => c.external_uid !== null)
            .map(x => `(
              '${x.uid}',
              '${x.external_uid}',
              '${x.customer_uid}',
              '${x.pool_uid}',
              '${x.synthetic_account_uid}',
              '${x.custodial_account_uid}',
              '${x.status}',
              '${x.ready_to_use}',
              ${x.card_last_four_digits ? `'${x.card_last_four_digits}'` : null },
              ${x.issued_on ? `'${x.issued_on}'` : null },
              ${x.closed_at ? `'${x.closed_at}'` : null },
              ${x.locked_at ? `'${x.locked_at}'` : null },
              ${x.lock_reason ? `'${x.lock_reason.replace('\'', '\'\'')}'` : null }
            )`)
            .join(',');
        return knex.raw(`
            INSERT INTO ${schema}.debit_cards (
                uid,
                external_uid,
                customer_uid,
                pool_uid,
                synthetic_account_uid,
                custodial_account_uid,
                status,
                ready_to_use,
                card_last_four_digit,
                issued_on,
                closed_at,
                locked_at,
                lock_reason)
            VALUES
                ${values};
        `);
    }
};
