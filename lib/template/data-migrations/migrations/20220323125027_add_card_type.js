
exports.up = async(knex) => {
    await knex.schema.alterTable('debit_cards', function(table) {
        table.string('type');
    });
};

exports.down = async (knex) => {
    await knex.schema.table('debit_cards', function(table) {
        table.dropColumn('type');
    });
};
