const mapObject = require('../../utils/mapObject');
/**
 * This is the service for debit card-related features
 */
class DebitCardService {
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

    mapRizeDebitCardToDbDebitCard (rizeDebitCard) {
        const debitCardKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'external_uid', from: 'external_uid' },
            { to: 'customer_uid', from: 'customer_uid' },
            { to: 'name', from: 'name' },
            { to: 'pool_uid', from: 'pool_uid' },
            { to: 'synthetic_account_uid', from: 'synthetic_account_uid' },
            { to: 'custodial_account_uid', from: 'custodial_account_uid' },
            { to: 'status', from: 'status' },
            { to: 'ready_to_use', from: 'ready_to_use' },
            { to: 'lock_reason', from: 'lock_reason' },
            { to: 'issued_on', from: 'issued_on' },
            { to: 'locked_at', from: 'locked_at' },
            { to: 'closed_at', from: 'closed_at' },
            { to: 'opened_at', from: 'opened_at' },
            { to: 'closed_at', from: 'closed_at' },
            { to: 'shipping_address_street1', from: 'latest_shipping_address.street1' },
            { to: 'shipping_address_street2', from: 'latest_shipping_address.street2' },
            { to: 'shipping_address_city', from: 'latest_shipping_address.city' },
            { to: 'shipping_address_state', from: 'latest_shipping_address.state' },
            { to: 'shipping_address_postal_code', from: 'latest_shipping_address.postal_code' },
        ];

        return mapObject(rizeDebitCard, debitCardKeys);
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
    
    async getRizeDebitCard (debitCardUid) {
        return await this._rizeProvider.debitCard.get(debitCardUid);
    }

    async lockRizeDebitCard (debitCardUid, lockReason) {
        return await this._rizeProvider.debitCard.lock(debitCardUid, lockReason);
    }

    async unlockRizeDebitCard (debitCardUid) {
        return await this._rizeProvider.debitCard.unlock(debitCardUid);
    }

    async createRizeDebitCard (externalUid, customerUid, poolUid) {
        return await this._rizeProvider.debitCard.create(externalUid, customerUid, poolUid);
    }

    async addDebitCardToDb(debitCard) {
        return await this._dbProvider('debit_cards')
            .insert(debitCard);
    }


    async updateDebitCardInDb(debitcard) {
        return await this._dbProvider('debit_cards')
            .where({ uid: debitcard.uid })
            .update(debitcard);
    }

    async reissueDebitCard (debitCardUid, reissueReason) {
        return await this._rizeProvider.debitCard.reissue(debitCardUid, reissueReason);
    }
}

module.exports = DebitCardService;
