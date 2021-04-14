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

    async getTransactionEvents(customerExternalUid, limit = 100, offset = 0, transactionUids = []) {
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
