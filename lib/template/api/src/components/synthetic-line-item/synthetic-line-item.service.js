/**
 * This is the service for synthetic line items-related features
 */
class SyntheticLineItemService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getSyntheticLineItems(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        let query = this._dbProvider
            .select('sli.*')
            .from('synthetic_line_items as sli');

        const filterByTransactionUids = transactionUids && transactionUids.length > 0;

        // Joins
        if (filterByTransactionUids || customerExternalUid) {
            query = query.innerJoin('transactions as t', 'sli.transaction_uid', 't.uid');
        }

        if (customerExternalUid) {
            query = query
                .innerJoin('synthetic_accounts as sa', 'sli.synthetic_account_uid', 'sa.uid')
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid');
        }

        // Where
        if (filterByTransactionUids) {
            query = query.whereIn('sli.transaction_uid', transactionUids);
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

    async getSyntheticLineItemByUid(syntheticLineItemUid, customerExternalUid) {
        let query = this._dbProvider
            .select('sli.*')
            .from('synthetic_line_items as sli');

        if (customerExternalUid) {
            query = query
                .innerJoin('transactions as t', 'sli.transaction_uid', 't.uid')
                .innerJoin('synthetic_accounts as sa', 'sli.synthetic_account_uid', 'sa.uid')
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('sli.uid', syntheticLineItemUid)
            .first();

        return data;
    }
}

module.exports = SyntheticLineItemService;
