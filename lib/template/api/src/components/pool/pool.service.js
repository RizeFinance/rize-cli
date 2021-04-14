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

    async poolBelongsToCustomerExternalUid(poolUid, customerExternalUid) {
        const pool = await this._dbProvider
            .select('p.*')
            .from('pools as p')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .where('p.uid', poolUid)
            .where('c.external_uid', customerExternalUid)
            .first();

        return !!pool;
    }
}

module.exports = PoolService;
