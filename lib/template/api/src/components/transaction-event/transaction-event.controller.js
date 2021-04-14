/**
 * This is the controller for transaction event-related features
 */
class TransactionEventController {
    /**
     * @param {import('./transaction-event.service')} transactionEventService
     */
    constructor(transactionEventService) {
        /** @protected */
        this._transactionEventService = transactionEventService;
    }

    async getTransactionEvents(limit = 100, offset = 0, customerExternalUid, transactionUids = []) {
        const transactionEvents = await this._transactionEventService.getTransactionEvents(
            limit,
            offset,
            transactionUids,
            customerExternalUid
        );
        
        return transactionEvents;
    }
}

module.exports = TransactionEventController;
