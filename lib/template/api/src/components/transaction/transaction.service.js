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
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
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
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        query = query.where('t.uid', transactionUid).first();

        return await query;
    }

    async getRizeTransaction (transactionUid) {
        return await this._rizeProvider.transaction.get(transactionUid);
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
