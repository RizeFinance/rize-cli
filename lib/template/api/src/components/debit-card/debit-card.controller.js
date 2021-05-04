const uuid = require('uuid').v4;

/**
 * This is the controller for debit card-related features
 */
class DebitCardController {
    /**
     * @param {import('./debit-card.service')} debitCardService
     * @param {import('../pool/pool.service')} poolService
     */
    constructor(debitCardService, poolService) {
        /** @protected */
        this._debitCardService = debitCardService;

        /** @protected */
        this._poolService = poolService;
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
        const externalUid = uuid();
        const allowed = await this._poolService.getPoolByUid(
            poolUid,
            customerExternalUid
        );
        const customerUid = allowed.owner_customer_uid;
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
        
        const rizeDebitCard = await this._debitCardService.createRizeDebitCard(externalUid, customerUid, poolUid);
        const dbDebitCard = this._debitCardService.mapRizeDebitCardToDbDebitCard(rizeDebitCard);
        
        await this._debitCardService.addDebitCardToDb(dbDebitCard);

        return rizeDebitCard;
    }
}

module.exports = DebitCardController;