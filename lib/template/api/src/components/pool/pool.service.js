/**
 * This is the service for pool-related features
 */
class PoolService {
    /**
    * @param {import('knex').Knex} dbProvider
    */
    constructor(dbProvider) {
        /** @protected */
        this._dbProvider = dbProvider;
    }

    async getPoolByUid(poolUid, customerExternalUid) {
        let query = this._dbProvider
            .select('p.*')
            .from('pools as p');

        if (customerExternalUid) {
            query = query.innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const pool = await query.where('p.uid', poolUid).first();

        return pool;
    }
}

module.exports = PoolService;
