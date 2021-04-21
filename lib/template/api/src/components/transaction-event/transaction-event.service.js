/**
 * This is the service for transaction event-related features
 */
class TransactionEventService {
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

    async getRizeTransactionEvents(query) {
        return await this._rizeProvider.transaction.getTransactionEventList(query);
    }

    async getTransactionEvents(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        let query = this._dbProvider
            .select('te.*')
            .from('transaction_events as te');

        const filterByTransactionUids = transactionUids && transactionUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('transactions as t', 'te.transaction_uid', 't.uid')
                .innerJoin('synthetic_accounts as sa', function () {
                    this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                        .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
                })
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid');
        }

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

    async getTransactionEventByUid(transactionEventUid, customerExternalUid) {
        let query = this._dbProvider
            .select('te.*')
            .from('transaction_events as te');

        if (customerExternalUid) {
            query = query
                .innerJoin('transactions as t', 'te.transaction_uid', 't.uid')
                .innerJoin('synthetic_accounts as sa', function () {
                    this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                        .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
                })
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('te.uid', transactionEventUid)
            .first();

        return data;
    }

    async addTransactionEventToDb (transactionEvent) {
        return await this._dbProvider('transaction_events').insert(transactionEvent);
    }

    async updateTransactionEventInDb(transactionEvent) {
        return await this._dbProvider('transaction_events')
            .where({ uid: transactionEvent.uid })
            .update(transactionEvent);
    }
}

module.exports = TransactionEventService;
