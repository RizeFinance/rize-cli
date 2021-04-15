/**
 * This is the controller for synthetic line items-related features
 */
class SyntheticLineItemController {
    /**
     * @param {import('./synthetic-line-item.service')} syntheticLineItemService
     */
    constructor(syntheticLineItemService) {
        /** @protected */
        this._syntheticLineItemService = syntheticLineItemService;
    }

    async getSyntheticLineItems(customerExternalUid, limit = 100, offset = 0, transactionUids = []) {
        const syntheticLineItems = await this._syntheticLineItemService.getSyntheticLineItems(
            limit,
            offset,
            transactionUids,
            customerExternalUid,
        );

        return syntheticLineItems;
    }

    async getSyntheticLineItemByUid(customerExternalUid, syntheticLineItemUid) {
        const syntheticLineItem = await this._syntheticLineItemService.getSyntheticLineItemByUid(
            syntheticLineItemUid,
            customerExternalUid
        );

        return syntheticLineItem;
    }
}

module.exports = SyntheticLineItemController;
