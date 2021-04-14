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

    async getCustodialAccounts(customerExternalUid, limit = 100, offset = 0) {
        const custodialAccounts = await this._custodialAccountService.getCustodialAccounts(
            customerExternalUid,
            limit,
            offset
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
