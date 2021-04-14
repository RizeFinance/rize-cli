/**
 * This is the service for transaction-related features
 */
class TransactionService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor (dbProvider) {
        /** @protected */
        this._dbProvider = dbProvider;
    }

    async getTransactions (customerExternalUid, limit = 100, offset = 0) {
        const query = this._dbProvider
            .select('t.*')
            .from('transactions as t')
            .innerJoin('synthetic_accounts as sa', function () {
                this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                    .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
            })
            .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
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

    async getTransactionByUid (customerExternalUid, transactionUid) {
        const data = await this._dbProvider
            .select('t.*')
            .from('transactions as t')
            .innerJoin('synthetic_accounts as sa', function () {
                this.on('t.source_synthetic_account_uid', '=', 'sa.uid')
                    .orOn('t.destination_synthetic_account_uid', '=', 'sa.uid');
            })
            .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .where('c.external_uid', customerExternalUid)
            .where('t.uid', transactionUid)
            .first();

        return data;
    }
}

module.exports = TransactionService;
