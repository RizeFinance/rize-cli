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

    async getSyntheticAccounts(customerExternalUid, limit = 100, offset = 0) {
        const query = this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa')
            .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .where('c.external_uid', customerExternalUid);

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

    async getSyntheticAccountByUid(customerExternalUid, syntheticAccountUid) {
        const data = await this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa')
            .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .where('c.external_uid', customerExternalUid)
            .where('sa.uid', syntheticAccountUid)
            .first();

        return data;
    }
}

module.exports = SyntheticAccountService;
