const Knex = require('knex');

function attachPaginate() {
    Knex.QueryBuilder.extend('paginate', async function paginate({
        totalCount = null,
        offset = 0,
        limit = null
    }) {
        let pagination = {};

        if (isNaN(parseInt(totalCount))) {
            const countQuery = new this.constructor(this.client)
                .count('* as total')
                .from(
                    this.clone()
                        .offset(0)
                        .clearOrder()
                        .as('__count__query__'),
                )
                .first();

            const { total } = await countQuery;
            pagination.total_count = parseInt(total);
        } else {
            pagination.total_count = Math.ceil(totalCount);
        }

        let newSource = this.clone();

        if (!isNaN(parseInt(limit))) {
            newSource = newSource
                .offset(offset)
                .limit(limit);
        }

        pagination.limit = limit;
        pagination.offset = offset;

        const query = newSource.clone();

        return { query, pagination };
    });
}

module.exports = function DbProvider(databaseConfig) {
    attachPaginate();
    return Knex(databaseConfig);
};
