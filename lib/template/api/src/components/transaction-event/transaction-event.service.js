const mapObject = require('../../utils/mapObject');

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

    mapRizeTransactionEventToDbTransactionEvent(rizeTransactionEvent) {
        const transactionEventKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'settled_index', from: 'settled_index' },
            { to: 'transaction_uid', from: 'transaction_uid' },
            { to: 'phase', from: 'phase' },
            { to: 'source_custodial_account_uid', from: 'source_custodial_account_uid' },
            { to: 'destination_custodial_account_uid', from: 'destination_custodial_account_uid' },
            { to: 'status', from: 'status' },
            { to: 'us_dollar_amount', from: 'us_dollar_amount' },
            { to: 'type', from: 'type' },
            { to: 'net_asset', from: 'net_asset' },
            { to: 'description', from: 'description' },
            { to: 'created_at', from: 'created_at' },
            { to: 'settled_at', from: 'settled_at' }
        ];

        return mapObject(rizeTransactionEvent, transactionEventKeys);
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
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid');
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
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
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
