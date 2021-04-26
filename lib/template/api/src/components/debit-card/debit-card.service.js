/**
 * This is the service for debit card-related features
 */
class DebitCardService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor(dbProvider) {
        /** @protected */
        this._dbProvider = dbProvider;
    }

    async getDebitCards(limit = 100, offset = 0, customerExternalUid, poolUids) {
        let query = this._dbProvider
            .select('d.*')
            .from('debit_cards as d');

        const filterByPool = poolUids && poolUids.length > 0;

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 'd.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        if (filterByPool) {
            query = query.whereIn('d.pool_uid', poolUids);
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

    async getDebitCardByUid (debitCardUid, customerExternalUid) {
        let query = this._dbProvider
            .select('d.*')
            .from('debit_cards as d');

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 'd.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        query = query.where('d.uid', debitCardUid).first();

        return await query;
    }
}

module.exports = DebitCardService;
