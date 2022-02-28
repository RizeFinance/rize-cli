const mapObject = require('../../utils/mapObject');

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

    mapRizeSyntheticLineItemToDbSyntheticLineItem (rizeSyntheticLineItem) {
        const syntheticLineItemKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'settled_index', from: 'settled_index' },
            { to: 'transaction_uid', from: 'transaction_uid' },
            { to: 'synthetic_account_uid', from: 'synthetic_account_uid' },
            { to: 'status', from: 'status' },
            { to: 'us_dollar_amount', from: 'us_dollar_amount' },
            { to: 'running_us_dollar_balance', from: 'running_us_dollar_balance' },
            { to: 'running_asset_balance', from: 'running_asset_balance' },
            { to: 'asset_quantity', from: 'asset_quantity' },
            { to: 'asset_type', from: 'asset_type' },
            { to: 'asset_unit_price', from: 'asset_unit_price' },
            { to: 'description', from: 'description' },
            { to: 'created_at', from: 'created_at' },
            { to: 'settled_at', from: 'settled_at' }
        ];

        return mapObject(rizeSyntheticLineItem, syntheticLineItemKeys);
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
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid');
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
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('sli.uid', syntheticLineItemUid)
            .first();

        return data;
    }

    async addSyntheticLineItemToDb (syntheticLineItem) {
        return await this._dbProvider('synthetic_line_items').insert(syntheticLineItem);
    }

    async updateSyntheticLineItemInDb(syntheticLineItem) {
        return await this._dbProvider('synthetic_line_items')
            .where({ uid: syntheticLineItem.uid })
            .update(syntheticLineItem);
    }
}

module.exports = SyntheticLineItemService;
