/**
 * This is the controller for debit card-related features
 */
class DebitCardController {
    /**
     * @param {import('./debit-card.service')} debitCardService
     * @param {import('../pool/pool.service')} poolService
     * @param {import('../customer/customer.service')} customerService
     */
    constructor(debitCardService, poolService, customerService) {
        /** @protected */
        this._debitCardService = debitCardService;

        /** @protected */
        this._poolService = poolService;

        /** @protected */
        this._customerService = customerService;
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

    async getDebitCardByUid (customerExternalUid, debitCardUid) {
        const debitCard = await this._debitCardService.getDebitCardByUid(
            debitCardUid,
            customerExternalUid
        );

        return debitCard;
    }

    async createDebitCard (customerExternalUid, poolUid) {

        const allowed = await this._poolService.getPoolByUid(
            poolUid,
            customerExternalUid
        );

        if (!allowed) {
            throw {
                status: 403,
                data: {
                    errors: [
                        {
                            title: 'Could not create Debit Card',
                            detail: 'This customer does not own the pool',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }


        const customer = await this._customerService.getCustomerByExternalUid(customerExternalUid);

        const rizeDebitCard = await this._debitCardService.createRizeDebitCard(customerExternalUid, customer.uid, poolUid);
        const dbDebitCard = this._debitCardService.mapRizeDebitCardToDbDebitCard(rizeDebitCard);

        await this._debitCardService.addDebitCardToDb(dbDebitCard);

        return rizeDebitCard;
    }

    async lockDebitCardByUid (customerExternalUid, debitCardUid, lockReason) {
        // Check if the customer is associated with the debit card
        const allowed = await this._debitCardService.getDebitCardByUid(
            debitCardUid,
            customerExternalUid
        );

        if (!allowed) {
            throw {
                status: 403,
                data: {
                    errors: [
                        {
                            title: 'Could not lock debit card',
                            detail: 'This customer does not own the debit card',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        const lockedDebitCard = await this._debitCardService.lockRizeDebitCard(debitCardUid, lockReason);
        const dbDebitCard = this._debitCardService.mapRizeDebitCardToDbDebitCard(lockedDebitCard);
        await this._debitCardService.updateDebitCardInDb(dbDebitCard);

        return lockedDebitCard;
    }
}

module.exports = DebitCardController;
