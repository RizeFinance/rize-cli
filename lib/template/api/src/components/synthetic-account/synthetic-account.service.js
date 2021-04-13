/**
 * This is the service for synthetic account-related features
 */
class SyntheticAccountService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getSyntheticAccounts(limit = 100, offset = 0) {
        const query = this._dbProvider.from('synthetic_accounts');
        const paginatedQuery = await query.paginate({
            limit,
            offset
        });

        const data = await this._dbProvider.select('*')
            .from(paginatedQuery.query.select('*').as('baseQuery'));

        return {
            ...paginatedQuery.pagination,
            data
        };
    }
}

module.exports = SyntheticAccountService;
