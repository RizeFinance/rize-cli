/**
 * This is the service for synthetic line items-related features
 */
class SyntheticLineItemService {
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

    async getRizeSyntheticLineItems(query) {
        return await this._rizeProvider.transaction.getSyntheticLineItemList(query);
    }

    async getSyntheticLineItems(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        let query = this._dbProvider
            .select('sli.*')
            .from('synthetic_line_items as sli');

        const filterByTransactionUids = transactionUids && transactionUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('transactions as t', 'sli.transaction_uid', 't.uid')
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

    async updateSyntheticLineItemInDb(syntheticLineItem) {
        return await this._dbProvider('synthetic_line_items')
            .where({ uid: syntheticLineItem.uid })
            .update(syntheticLineItem);
    }
}

module.exports = SyntheticLineItemService;
