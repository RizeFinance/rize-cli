/**
 * This is the controller for custodial account-related features
 */
class CustodialAccountController {
    /**
     * @param {import('./custodialAccount.service')} custodialAccountService
     */
    constructor(custodialAccountService) {
        /** @ignore @protected */
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

    async getCustodialAccountByUid(customerExternalUid, custodialAccountUid) {
        const custodialAccount = await this._custodialAccountService.getCustodialAccountByUid(
            customerExternalUid,
            custodialAccountUid
        );

        return custodialAccount;
    }
}

module.exports = CustodialAccountController;
