/**
 * This is the controller for transaction event related features
 */
class TransactionEventController {
    /**
     * @param {import('./transaction-event.service')} transactionEventService
     */
    constructor(transactionEventService) {
        /** @protected */
        this._transactionEventService = transactionEventService;
    }

    async getTransactionEvents(limit = 100, offset = 0, uids = [], customerExternalUid) {
        const transactionEvents = await this._transactionEventService.getTransactionEvents(
            limit,
            offset,
            uids,
            customerExternalUid
        );
        
        return transactionEvents;
    }
}

module.exports = TransactionEventController;
