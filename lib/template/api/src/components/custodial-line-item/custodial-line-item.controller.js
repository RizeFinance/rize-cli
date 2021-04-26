/**
 * This is the controller for custodial line item-related features
 */
class CustodialLineItemController {
    /**
     * @param {import('./custodial-line-item.service')} custodialLineItemService
     */
    constructor(custodialLineItemService) {
        /** @protected */
        this._custodialLineItemService = custodialLineItemService;
    }

    async getCustodialLineItems(customerExternalUid, limit = 100, offset = 0, transactionUids = []) {
        const custodialLineItems = await this._custodialLineItemService.getCustodialLineItems(
            limit,
            offset,
            transactionUids,
            customerExternalUid
        );

        return custodialLineItems;
    }

    async getCustodialLineItemByUid(customerExternalUid, custodialLineItemUid) {
        const custodialLineItem = await this._custodialLineItemService.getCustodialLineItemByUid(
            custodialLineItemUid,
            customerExternalUid
        );
        
        return custodialLineItem;
    }
}

module.exports = CustodialLineItemController;
