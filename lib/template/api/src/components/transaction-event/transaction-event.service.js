/**
 * This is the service for transaction event-related features
 */
 class TransactionEventService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor(dbProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
    }

    async getTransactionEvents(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        let query = this._dbProvider
            .select('te.*')
            .from('transaction_events as te');
        
        const filterByTransactionUids = transactionUids && transactionUids.length > 0;

        // Joins
        if (filterByTransactionUids || customerExternalUid) {
            query = query.innerJoin('transactions as t', 'te.transaction_uid', 't.uid');
        }

        if (customerExternalUid) {
            query = query
                .innerJoin('synthetic_accounts as sa', function () {
                    this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                        .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
                })
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid');
        }

        // Where
        if (filterByTransactionUids) {
            query = query.whereIn('te.transaction_uid', transactionUids);
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

module.exports = TransactionEventService;