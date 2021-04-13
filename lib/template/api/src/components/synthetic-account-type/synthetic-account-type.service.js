/**
 * This is the service for synthetic account type-related features
 */
class SyntheticAccountTypeService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getSyntheticAccountTypes(limit = 100, offset = 0) {
        const query = this._dbProvider.from('synthetic_account_types');
        const paginatedQuery = await query.paginate({
            limit,
            offset
        });

        const data = await paginatedQuery.query;

        return {
            ...paginatedQuery.pagination,
            data
        };
    }

    async getSyntheticAccountTypesByUid(uid) {
        const data = await this._dbProvider
            .select('*')
            .from('synthetic_account_types')
            .where('uid', uid)
            .first();

        return {
            ...data
        };
    }
}

module.exports = SyntheticAccountTypeService;
