/**
 * This is the service for custodial account-related features
 */
class CustodialAccountService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @protected */
        this._dbProvider = dbProvider;

        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    async getCustodialAccounts(limit = 100, offset = 0, customerExternalUid, custodialAccountUids) {
        let query = this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca');

        if (customerExternalUid) {
            query = query.innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        if (custodialAccountUids && custodialAccountUids.length > 0) {
            query = query.whereIn('ca.uid', custodialAccountUids);
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

    async getRizeCustodialAccounts (limit = 100, offset = 0, customerUids) {
        return await this._rizeProvider.custodialAccount.getList({
            limit,
            offset,
            customer_uid: customerUids
        });
    }

    async addCustodialAccountsToDb (custodialAccounts) {
        return await this._dbProvider('custodial_accounts')
            .insert(custodialAccounts);
    }
}

module.exports = CustodialAccountService;
