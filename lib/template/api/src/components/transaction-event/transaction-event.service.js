/**
 * This is the service for synthetic account type-related features
 */
 class TransactionEventService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider) {
        /** @ignore @protected */
        this._dbProvider = dbProvider;
        this._rizeProvider = rizeProvider;
    }

    async getTransactionEvents(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        const query = this._dbProvider
            .select('te.*')
            .from('transaction_events as te')
            .innerJoin('transactions as t', 'te.transaction_uid', 't.uid')
            .innerJoin('synthetic_accounts as sa', function () {
                this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                    .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
            })
            .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .whereIn('te.transaction_uid', transactionUids)
            .where('c.external_uid', customerExternalUid)
            .distinct();

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
