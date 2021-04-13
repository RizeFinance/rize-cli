/**
 * This is the controller for synthetic account-related features
 */
class SyntheticAccountController {
    /**
     * @param {import('./syntheticAccount.service')} syntheticAccountService
     */
    constructor(syntheticAccountService) {
        /** @ignore @protected */
        this._syntheticAccountService = syntheticAccountService;
    }

    async getSyntheticAccounts(customerExternalUid, limit = 100, offset = 0) {
        const syntheticAccounts = await this._syntheticAccountService.getSyntheticAccounts(
            customerExternalUid,
            limit,
            offset
        );

        return syntheticAccounts;
    }
}

module.exports = SyntheticAccountController;
