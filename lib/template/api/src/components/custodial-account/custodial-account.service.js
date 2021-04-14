/**
 * This is the service for custodial account-related features
 */
class CustodialAccountService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getCustodialAccounts(customerExternalUid, limit = 100, offset = 0) {
        const query = this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca')
            .innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
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

    async getCustodialAccountByUid(customerExternalUid, custodialAccountUid) {
        const data = await this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca')
            .innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .where('c.external_uid', customerExternalUid)
            .where('ca.uid', custodialAccountUid)
            .first();

        return data;
    }
}

module.exports = CustodialAccountService;
