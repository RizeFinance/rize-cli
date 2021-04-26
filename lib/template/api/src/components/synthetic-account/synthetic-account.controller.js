const uuid = require('uuid').v4;

/**
 * This is the controller for synthetic account-related features
 */
class SyntheticAccountController {
    /**
     * @param {import('./synthetic-account.service')} syntheticAccountService
     * @param {import('../pool/pool.service')} poolService
     */
    constructor(syntheticAccountService, poolService) {
        /** @protected */
        this._syntheticAccountService = syntheticAccountService;

        /** @protected */
        this._poolService = poolService;
    }

    async getSyntheticAccounts(customerExternalUid, limit = 100, offset = 0) {
        const syntheticAccounts = await this._syntheticAccountService.getSyntheticAccounts(
            limit,
            offset,
            customerExternalUid,
        );

        return syntheticAccounts;
    }

    async getSyntheticAccountByUid(customerExternalUid, syntheticAccountUid) {
        const syntheticAccount = await this._syntheticAccountService.getSyntheticAccountByUid(
            syntheticAccountUid,
            customerExternalUid
        );

        return syntheticAccount;
    }

    async createSyntheticAccount(customerExternalUid, data) {
        // Check if the customer is associated with the pool
        const allowed = await this._poolService.getPoolByUid(
            data.pool_uid,
            customerExternalUid
        );

        if (!allowed) {
            throw {
                status: 403,
                data: {
                    errors: [
                        {
                            title: 'Could not create Synthetic Account',
                            detail: 'This customer does not own the pool',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        data.external_uid = uuid();

        const rizeSyntheticAccount = await this._syntheticAccountService.createRizeSyntheticAccount(data);

        delete rizeSyntheticAccount.account_number;
        delete rizeSyntheticAccount.customer_uid;

        await this._syntheticAccountService.addSyntheticAccountToDb(rizeSyntheticAccount);

        return rizeSyntheticAccount;
    }

    async updateSyntheticAccount(customerExternalUid, syntheticAccountUid, data) {
        // Check if the customer is associated with the synthetic account
        const allowed = await this._syntheticAccountService.getSyntheticAccountByUid(
            syntheticAccountUid,
            customerExternalUid
        );

        if (!allowed) {
            throw {
                status: 403,
                data: {
                    errors: [
                        {
                            title: 'Could not update Synthetic Account',
                            detail: 'This customer does not own the synthetic account',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        const rizeSyntheticAccount = await this._syntheticAccountService
            .updateRizeSyntheticAccount(syntheticAccountUid, data);

        delete rizeSyntheticAccount.account_number;
        delete rizeSyntheticAccount.customer_uid;

        await this._syntheticAccountService.updateSyntheticAccountInDb(rizeSyntheticAccount);

        return rizeSyntheticAccount;
    }

    async archiveSyntheticAccount(customerExternalUid, syntheticAccountUid) {
        // Check if the customer is associated with the synthetic account
        const allowed = await this._syntheticAccountService.getSyntheticAccountByUid(
            syntheticAccountUid,
            customerExternalUid
        );

        if (!allowed) {
            throw {
                status: 403,
                data: {
                    errors: [
                        {
                            title: 'Could not archive Synthetic Account',
                            detail: 'This customer does not own the synthetic account',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        await this._syntheticAccountService.archiveRizeSyntheticAccount(syntheticAccountUid);
    }
}

module.exports = SyntheticAccountController;
