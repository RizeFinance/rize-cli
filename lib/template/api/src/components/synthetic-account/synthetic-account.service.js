/**
 * This is the service for synthetic account-related features
 */
class SyntheticAccountService {
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

    async getSyntheticAccounts(limit = 100, offset = 0, customerExternalUid) {
        let query = this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa');

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
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

    async getSyntheticAccountByUid(syntheticAccountUid, customerExternalUid) {
        let query = this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa');
        
        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('sa.uid', syntheticAccountUid)
            .first();

        return data;
    }

    async createRizeSyntheticAccount(data) {
        return await this._rizeProvider.syntheticAccount.create(data);
    }

    async addSyntheticAccountToDb(syntheticAccount) {
        return await this._dbProvider('synthetic_accounts')
            .insert(syntheticAccount);
    }

    async updateRizeSyntheticAccount(uid, data) {
        return await this._rizeProvider.syntheticAccount.update(
            uid,
            data.name,
            data.note
        );
    }

    async getRizeSyntheticAccount(syntheticAccountUid) {
        return await this._rizeProvider.syntheticAccount.get(syntheticAccountUid);
    }

    async updateSyntheticAccountInDb(syntheticAccount) {
        return await this._dbProvider('synthetic_accounts')
            .where({ uid: syntheticAccount.uid })
            .update(syntheticAccount);
    }

    async archiveRizeSyntheticAccount(syntheticAccountUid) {
        return await this._rizeProvider.syntheticAccount.archive(syntheticAccountUid);
    }
}

module.exports = SyntheticAccountService;
