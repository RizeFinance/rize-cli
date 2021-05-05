const mapObject = require('../../utils/mapObject');

/**
 * This is the service for custodial line item-related features
 */
class CustodialLineItemService {
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

    mapRizeCustodialLineItemToDbCustodialLineItem (rizeCustodialLineItem) {
        const custodialLineItemKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'settled_index', from: 'settled_index' },
            { to: 'transaction_uid', from: 'transaction_uid' },
            { to: 'transaction_event_uid', from: 'transaction_event_uid' },
            { to: 'custodial_account_uid', from: 'custodial_account_uid' },
            { to: 'status', from: 'status' },
            { to: 'us_dollar_amount', from: 'us_dollar_amount' },
            { to: 'running_us_dollar_balance', from: 'running_us_dollar_balance' },
            { to: 'type', from: 'type' },
            { to: 'description', from: 'description' },
            { to: 'created_at', from: 'created_at' },
            { to: 'occurred_at', from: 'occurred_at' },
            { to: 'settled_at', from: 'settled_at' }
        ];

        return mapObject(rizeCustodialLineItem, custodialLineItemKeys);
    }

    async getRizeCustodialLineItems(query) {
        return await this._rizeProvider.transaction.getCustodialLineItemList(query);
    }

    async getCustodialLineItems(limit = 100, offset = 0, transactionUids, customerExternalUid) {
        let query = this._dbProvider
            .select('cli.*')
            .from('custodial_line_items as cli');

        const filterByTransactionUids = transactionUids && transactionUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('custodial_accounts as ca', 'cli.custodial_account_uid', 'ca.uid')
                .innerJoin('customers as c', 'ca.customer_uid', 'c.uid');
        }

        if (filterByTransactionUids) {
            query = query.whereIn('cli.transaction_uid', transactionUids);
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

    async getCustodialLineItemByUid(custodialLineItemUid, customerExternalUid) {
        let query = this._dbProvider
            .select('cli.*')
            .from('custodial_line_items as cli');

        if (customerExternalUid) {
            query = query
                .innerJoin('custodial_accounts as ca', 'cli.custodial_account_uid', 'ca.uid')
                .innerJoin('customers as c', 'ca.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('cli.uid', custodialLineItemUid)
            .first();

        return data;
    }

    async addCustodialLineItemToDb (custodialLineItem) {
        return await this._dbProvider('custodial_line_items').insert(custodialLineItem);
    }

    async updateCustodialLineItemInDb(custodialLineItem) {
        return await this._dbProvider('custodial_line_items')
            .where({ uid: custodialLineItem.uid })
            .update(custodialLineItem);
    }
}

module.exports = CustodialLineItemService;
