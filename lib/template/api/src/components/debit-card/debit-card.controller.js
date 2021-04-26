/**
 * This is the controller for debit card-related features
 */
class DebitCardController {
    /**
     * @param {import('./debit-card.service')} debitCardService
     */
    constructor(debitCardService) {
        /** @protected */
        this._debitCardService = debitCardService;
    }

    async getDebitCards(customerExternalUid, limit = 100, offset = 0, poolUids) {
        const debitCards = await this._debitCardService.getDebitCards(
            limit,
            offset,
            customerExternalUid,
            poolUids
        );

        return debitCards;
    }
}

module.exports = DebitCardController;
