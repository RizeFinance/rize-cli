/**
 * This is the service for custodial account-related features
 */
class CustodialAccountService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor(dbProvider) {
        /** @protected */
        this._dbProvider = dbProvider;
    }

    async getCustodialAccounts(limit = 100, offset = 0, customerExternalUid) {
        let query = this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca');

        if (customerExternalUid) {
            query = query.innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

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

    async getCustodialAccountByUid (custodialAccountUid, customerExternalUid) {
        let query = this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca');

        if (customerExternalUid) {
            query = query
                .innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('ca.uid', custodialAccountUid)
            .first();

        return data;
    }
}

module.exports = CustodialAccountService;
