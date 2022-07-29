const mapObject = require('../../utils/mapObject');
/**
 * This is the service for synthetic account-related features
 */
class SyntheticAccountService {
    /**
    * @param {import('knex').Knex} dbProvider
    * @param {import('@rizefinance/rize-js')} rizeProvider
    */
    constructor(dbProvider, rizeProvider, accountAuthProvider) {
        /** @protected */
        this._dbProvider = dbProvider;
        
        /** @protected */
        this._rizeProvider = rizeProvider;
        this._accountAuthProvider = accountAuthProvider;
    }

    mapRizeSyntheticAccountToDbSyntheticAccount (rizeSyntheticAccount) {
        const syntheticAccountKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'external_uid', from: 'external_uid' },
            { to: 'customer_uid', from: 'customer_uid' },
            { to: 'name', from: 'name' },
            { to: 'pool_uid', from: 'pool_uid' },
            { to: 'synthetic_account_type_uid', from: 'synthetic_account_type_uid' },
            { to: 'synthetic_account_category', from: 'synthetic_account_category' },
            { to: 'status', from: 'status' },
            { to: 'liability', from: 'liability' },
            { to: 'net_usd_balance', from: 'net_usd_balance' },
            { to: 'net_usd_pending_balance', from: 'net_usd_pending_balance' },
            { to: 'net_usd_available_balance', from: 'net_usd_available_balance' },
            { to: 'master_account', from: 'master_account' },
            { to: 'opened_at', from: 'opened_at' },
            { to: 'closed_at', from: 'closed_at' },
            { to: 'closed_to_synthetic_account_uid', from: 'closed_to_synthetic_account_uid' },
            { to: 'account_number', from: 'account_number' },
            { to: 'account_number_last_four', from: 'account_number_last_four' },
            { to: 'routing_number', from: 'routing_number' },
            { to: 'asset_balances', from: 'asset_balances', type: 'json' },
        ];

        return mapObject(rizeSyntheticAccount, syntheticAccountKeys);
    }

    async getSyntheticAccounts(limit = 100, offset = 0, customerExternalUid) {
        await this.syncBrokerageAccounts(customerExternalUid);

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

    async syncBrokerageAccounts(customerExternalUid) {
        let query = this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa');

        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const brokerageQuery = await query.where('sa.synthetic_account_category', 'target_yield_account')
            .paginate({
                limit: 100,
                offset: 0
            });

        const brokerageData = await brokerageQuery.query;

        for (let data of brokerageData) {
            const rizeBrokerageAccount = await this.getRizeSyntheticAccount(data.uid);
            const updatedDbBrokerageAccount = this.mapRizeSyntheticAccountToDbSyntheticAccount(rizeBrokerageAccount);
            await this.updateSyntheticAccountInDb(updatedDbBrokerageAccount);
        }

        return;
    }

    async getSyntheticAccountByUid(syntheticAccountUid, customerExternalUid, customerUid) {
        let data;
        
        let query = this._dbProvider
            .select('sa.*')
            .from('synthetic_accounts as sa');
        
        if (customerExternalUid) {
            query = query
                .innerJoin('customers as c', 'sa.customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        if(syntheticAccountUid) {
            data = await query
                .where('sa.uid', syntheticAccountUid)
                .first();
        }

        if(customerUid) {
            data = await query
                .where('sa.customer.uid', customerUid)
                .first();
        }

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

    async getLinkToken() {
        return await this._accountAuthProvider.getLinkToken();
    }

    async getProcessorToken(publicToken, accountId) {
        return await this._accountAuthProvider.getProcessorToken(publicToken, accountId);
    }
}

module.exports = SyntheticAccountService;
