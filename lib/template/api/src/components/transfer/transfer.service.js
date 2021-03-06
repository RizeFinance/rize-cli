const mapObject = require('../../utils/mapObject');

/**
 * This is the service for transfer-related features
 */
class TransferService {
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

    mapRizeTransferToDbTransfer (rizeTransfer) {
        const transferKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'external_uid', from: 'external_uid' },
            { to: 'source_synthetic_account_uid', from: 'source_synthetic_account_uid' },
            { to: 'destination_synthetic_account_uid', from: 'destination_synthetic_account_uid' },
            { to: 'initiating_customer_uid', from: 'initiating_customer_uid' },
            { to: 'usd_transfer_amount', from: 'usd_transfer_amount' },
            { to: 'status', from: 'status' },
            { to: 'created_at', from: 'created_at' }
        ];

        return mapObject(rizeTransfer, transferKeys);
    }

    async getTransfers(limit = 100, offset = 0, customerExternalUid, syntheticAccountUids) {
        let query = this._dbProvider
            .select('t.*')
            .from('transfers as t');

        const filterBySyntheticAccount = syntheticAccountUids && syntheticAccountUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 't.initiating_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        if (filterBySyntheticAccount) {
            query = query
                .whereIn('t.source_synthetic_account_uid', syntheticAccountUids)
                .orWhereIn('t.destination_synthetic_account_uid', syntheticAccountUids);
        }

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

    async getTransferByUid(transferUid, customerExternalUid) {
        let query = this._dbProvider
            .select('t.*')
            .from('transfers as t');

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 't.initiating_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('t.uid', transferUid)
            .first();

        return data;
    }
  
    async getRizeTransfer(transferUid) {
        return await this._rizeProvider.transfer.get(transferUid);
    }

    async createRizeTransfer(data) {
        return await this._rizeProvider.transfer.init(
            data.external_uid,
            data.source_synthetic_account_uid,
            data.destination_synthetic_account_uid,
            data.initiating_customer_uid,
            data.usd_transfer_amount
        );
    }

    async addTransferToDb(transfer) {
        return await this._dbProvider('transfers')
            .insert(transfer);
    }
  
    async updateTransferInDb(transfer) {
        return await this._dbProvider('transfers')
            .where({ uid: transfer.uid })
            .update(transfer);
    }
}

module.exports = TransferService;
