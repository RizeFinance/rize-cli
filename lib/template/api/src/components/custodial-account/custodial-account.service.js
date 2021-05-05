const mapObject = require('../../utils/mapObject');

/**
 * This is the service for custodial account-related features
 */
class CustodialAccountService {
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

    mapRizeCustodialAccountToDbCustodialAccount (rizeCustodialAccount) {
        const rizeCustodialAccountKeys = [
            { to: 'uid', from: 'uid' },
            { to: 'external_uid', from: 'external_uid' },
            { to: 'customer_uid', from: 'customer_uid' },
            { to: 'pool_uid', from: 'pool_uid' },
            { to: 'program_service_offering_uid', from: 'program_service_offering_uid' },
            { to: 'type', from: 'type' },
            { to: 'liability', from: 'liability' },
            { to: 'name', from: 'name' },
            { to: 'primary_account', from: 'primary_account' },
            { to: 'status', from: 'status' },
            { to: 'net_usd_balance', from: 'net_usd_balance' },
            { to: 'net_usd_pending_balance', from: 'net_usd_pending_balance' },
            { to: 'net_usd_available_balance', from: 'net_usd_available_balance' },
            { to: 'account_number_masked', from: 'account_number_masked' },
            { to: 'routing_number', from: 'routing_number' },
            { to: 'opened_at', from: 'opened_at' },
            { to: 'closed_at', from: 'closed_at' }
        ];

        return mapObject(rizeCustodialAccount, rizeCustodialAccountKeys);
    }

    async getCustodialAccounts(limit = 100, offset = 0, customerExternalUid, custodialAccountUids) {
        let query = this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca');

        if (customerExternalUid) {
            query = query.innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        if (custodialAccountUids && custodialAccountUids.length > 0) {
            query = query.whereIn('ca.uid', custodialAccountUids);
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

    async getCustodialAccountByUid (custodialAccountUid, customerExternalUid) {
        let query = this._dbProvider
            .select('ca.*')
            .from('custodial_accounts as ca');

        if (customerExternalUid) {
            query = query
                .innerJoin('pools as p', 'ca.pool_uid', 'p.uid')
                .innerJoin('customers as c', 'p.owner_customer_uid', 'c.uid')
                .where('c.external_uid', customerExternalUid);
        }

        const data = await query
            .where('ca.uid', custodialAccountUid)
            .first();

        return data;
    }

    async getRizeCustodialAccounts (limit = 100, offset = 0, customerUids) {
        return await this._rizeProvider.custodialAccount.getList({
            limit,
            offset,
            customer_uid: customerUids
        });
    }

    async addCustodialAccountsToDb (custodialAccounts) {
        return await this._dbProvider('custodial_accounts')
            .insert(custodialAccounts);
    }
}

module.exports = CustodialAccountService;
