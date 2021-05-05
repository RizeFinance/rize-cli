const mapObject = require('../../utils/mapObject');

/**
 * This is the service for transaction-related features
 */
class TransactionService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor (dbProvider, rizeProvider) {
        /** @protected */
        this._dbProvider = dbProvider;

        /** @protected */
        this._rizeProvider = rizeProvider;
    }

    mapRizeTransactionToDbTransaction (rizeTransaction) {
        const transactionKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'id', from: 'id' },
            { to: 'settled_index', from: 'settled_index' },
            { to: 'transfer_uid', from: 'transfer_uid' },
            { to: 'source_synthetic_account_uid', from: 'source_synthetic_account_uid' },
            { to: 'destination_synthetic_account_uid', from: 'destination_synthetic_account_uid' },
            { to: 'status', from: 'status' },
            { to: 'us_dollar_amount', from: 'us_dollar_amount' },
            { to: 'type', from: 'type' },
            { to: 'net_asset', from: 'net_asset' },
            { to: 'description', from: 'description' },
            { to: 'created_at', from: 'created_at' },
            { to: 'settled_at', from: 'settled_at' }
        ];

        return mapObject(rizeTransaction, transactionKeys);
    }

    async getTransactions (limit = 100, offset = 0, customerExternalUid, syntheticAccountUids) {
        let query = this._dbProvider
            .select('t.*')
            .from('transactions as t');

        const filterBySyntheticAccount = syntheticAccountUids && syntheticAccountUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('synthetic_accounts as sa', function () {
                    this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                        .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
                })
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        if (filterBySyntheticAccount) {
            query = query.whereIn('sa.uid', syntheticAccountUids);
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

    async getTransactionByUid (transactionUid, customerExternalUid) {
        let query = this._dbProvider
            .select('t.*')
            .from('transactions as t');

        if (customerExternalUid) {
            query = query
                .innerJoin('synthetic_accounts as sa', function () {
                    this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                        .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
                })
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        query = query.where('t.uid', transactionUid).first();

        return await query;
    }

    async getRizeTransaction (transactionUid) {
        return await this._rizeProvider.transaction.get(transactionUid);
    }

    async getRizeTransactions (query) {
        return await this._rizeProvider.transaction.getList(query);
    }

    async addTransactionToDb (transaction) {
        return await this._dbProvider('transactions').insert(transaction);
    }

    async updateTransactionInDb(transaction) {
        return await this._dbProvider('transactions')
            .where({ uid: transaction.uid })
            .update(transaction);
    }
}

module.exports = TransactionService;
