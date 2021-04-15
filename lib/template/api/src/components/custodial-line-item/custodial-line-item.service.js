/**
 * This is the service for custodial line item-related features
 */
class CustodialLineItemService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor(dbProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
    }

    async getCustodialLineItems(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        let query = this._dbProvider
            .select('cli.*')
            .from('custodial_line_items as cli');
        
        const filterByTransactionUids = transactionUids && transactionUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('custodial_accounts as ca', 'cli.custodial_account_uid', 'ca.uid')
                .innerJoin('customers as c', 'ca.customer_uid', 'c.uid');
        }

        if (filterByTransactionUids) {
            query = query.whereIn('cli.transaction_uid', transactionUids);
        }
        if (customerExternalUid) {
            query = query.where('c.external_uid', customerExternalUid);
        }

        query = query.distinct();

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
}

module.exports = CustodialLineItemService;
