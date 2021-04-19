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

    async getTransfers(limit = 100, offset = 0, customerExternalUid) {
        let query = this._dbProvider
            .select('t.*')
            .from('transfers as t');

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 't.initiating_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
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

    async createRizeTransfer(data) {
        return await this._rizeProvider.transfer.create({
            externalUid: data.external_uid,
            sourceSyntheticAccountUid: data.source_synthetic_account_uid,
            destinationSyntheticAccountUid: data.destination_synthetic_account_uid,
            initiatingCustomerUid: data.initiating_customer_uid,
            usTransferAmount: data.usd_transfer_amount
        });
    }

    async addTransferToDb(transfer) {
        return await this._dbProvider('transfers')
            .insert(transfer);
    }
}

module.exports = TransferService;
