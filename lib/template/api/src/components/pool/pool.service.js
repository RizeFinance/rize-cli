const mapObject = require('../../utils/mapObject');

/**
 * This is the service for pool-related features
 */
class PoolService {
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

    mapRizePoolToDbPool (rizePool) {
        const poolKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'name', from: 'name' },
            { to: 'owner_customer_uid', from: 'owner_customer_uid' }
        ];

        return mapObject(rizePool, poolKeys);
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

    async getRizePool(poolUid) {
        return await this._rizeProvider.pool.get(poolUid);
    }

    async addPoolToDb(pool) {
        return await this._dbProvider('pools').insert(pool);
    }
}

module.exports = PoolService;
