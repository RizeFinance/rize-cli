/**
 * This is the controller for custodial account-related features
 */
class CustodialAccountController {
    /**
     * @param {import('./custodial-account.service')} custodialAccountService
     */
    constructor(custodialAccountService) {
        /** @protected */
        this._custodialAccountService = custodialAccountService;
    }

    async getCustodialAccounts(limit = 100, offset = 0, customerExternalUid) {
        const custodialAccounts = await this._custodialAccountService.getCustodialAccounts(
            limit,
            offset,
            customerExternalUid
        );

        return custodialAccounts;
    }

    async getCustodialAccountByUid(custodialAccountUid, customerExternalUid) {
        const custodialAccount = await this._custodialAccountService.getCustodialAccountByUid(
            custodialAccountUid,
            customerExternalUid
        );

        return custodialAccount;
    }
}

module.exports = CustodialAccountController;
