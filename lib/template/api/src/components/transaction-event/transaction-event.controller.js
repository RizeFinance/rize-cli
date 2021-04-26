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

    async getTransactionEventByUid(customerExternalUid, transactionEventUid) {
        const transactionEvent = await this._transactionEventService.getTransactionEventByUid(
            transactionEventUid,
            customerExternalUid
        );
        
        return transactionEvent;
    }
}

module.exports = TransactionEventController;
