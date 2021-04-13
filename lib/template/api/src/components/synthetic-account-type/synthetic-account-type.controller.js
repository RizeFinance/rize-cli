/**
 * This is the controller for synthetic account type-related features
 */
class SyntheticAccountTypeController {
    /**
     * @param {import('./syntheticAccountType.service')} syntheticAccountTypeService
     */
    constructor(syntheticAccountTypeService) {
        /** @ignore @protected */
        this._syntheticAccountTypeService = syntheticAccountTypeService;
    }

    async getSyntheticAccountTypes(limit = 100, offset = 0) {
        const syntheticAccountTypes = await this._syntheticAccountTypeService.getSyntheticAccountTypes(
            limit,
            offset
        );

        return syntheticAccountTypes;
    }

    async getSyntheticAccountTypesByUid(uid) {
        const syntheticAccountType = await this._syntheticAccountTypeService.getSyntheticAccountTypesByUid(uid);

        return syntheticAccountType;
    }
}

module.exports = SyntheticAccountTypeController;
