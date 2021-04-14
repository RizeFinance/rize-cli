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

    async getSyntheticAccounts(customerExternalUid, limit = 100, offset = 0) {
        const query = this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa')
            .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
            .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
            .where('c.external_uid', customerExternalUid);

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
                .innerJoin('pools as p', 'sa.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('sa.uid', syntheticAccountUid)
            .first();

        return data;
    }

    async createRizeSyntheticAccount(data) {
        return await this._rizeProvider.syntheticAccount.create({
            accountNumber: data.account_number,
            externalUid: data.external_uid,
            name: data.name,
            poolUid: data.pool_uid,
            routingNumber: data.routing_number,
            syntheticAccountTypeUid: data.synthetic_account_type_uid
        });
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

    async updateSyntheticAccountInDb(syntheticAccount) {
        return await this._dbProvider('synthetic_accounts')
            .where({ uid: syntheticAccount.uid })
            .update(syntheticAccount);
    }
}

module.exports = SyntheticAccountService;
