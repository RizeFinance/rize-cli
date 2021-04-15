/**
 * This is the controller for transaction-related features
 */
class TransactionController {
    /**
     * @param {import('./transaction.service')} transactionService
     */
    constructor (transactionService) {
        /** @protected */
        this._transactionService = transactionService;
    }

    async getTransactions (customerExternalUid, limit = 100, offset = 0) {
        const transactions = await this._transactionService.getTransactions(
            limit,
            offset,
            customerExternalUid
        );

        return transactions;
    }

    async getTransactionByUid (customerExternalUid, transactionUid) {
        const transaction = await this._transactionService.getTransactionByUid(
            transactionUid,
            customerExternalUid
        );

        return transaction;
    }
}

module.exports = TransactionController;
