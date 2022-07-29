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

    async getDebitCards(customerExternalUid, limit = 100, offset = 0) {
        const debitCards = await this._debitCardService.getDebitCards(
            limit,
            offset,
            customerExternalUid,
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

    async unlockDebitCardByUid (customerExternalUid, debitCardUid) {
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
                            title: 'Could not unlock debit card',
                            detail: 'This customer does not own the debit card',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        const unlockedDebitCard = await this._debitCardService.unlockRizeDebitCard(debitCardUid);
        const dbDebitCard = this._debitCardService.mapRizeDebitCardToDbDebitCard(unlockedDebitCard);
        await this._debitCardService.updateDebitCardInDb(dbDebitCard);

        return unlockedDebitCard;
    }

    async reissueDebitCard (customerExternalUid, debitCardUid, reissue_reason) {
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
                            title: 'Could not reissue debit card',
                            detail: 'This customer does not own the debit card',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        const reissueDebitCard = await this._debitCardService.reissueDebitCard(debitCardUid, reissue_reason);
        const dbDebitCard = this._debitCardService.mapRizeDebitCardToDbDebitCard(reissueDebitCard);
        await this._debitCardService.updateDebitCardInDb(dbDebitCard);
        return reissueDebitCard;
    }

    async activateDebitCard (customerExternalUid, debitCardUid, cardLastFourDigits, cvv, expiryDate) {
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
                            title: 'Could not activate debit card',
                            detail: 'This customer does not own the debit card',
                            occurred_at: (new Date()).toISOString()
                        }
                    ],
                    status: 403,
                }
            };
        }

        const activateDebitCard = await this._debitCardService.activateDebitCard(debitCardUid, cardLastFourDigits, cvv, expiryDate);
        const dbDebitCard = this._debitCardService.mapRizeDebitCardToDbDebitCard(activateDebitCard);
        await this._debitCardService.updateDebitCardInDb(dbDebitCard);
        return activateDebitCard;
    }
  
    async getPinSetToken (uid) {
        const pinSetToken = await this._debitCardService.getPinSetToken(uid);
        return pinSetToken;
    }

    async getAccessToken(debitCardUid) {
        const accessToken = await this._debitCardService.getAccessToken(debitCardUid);
        return accessToken;
    }

    async getVirtualCardImage(configId, token) {
        const image = await this._debitCardService.getVirtualCardImage(configId, token);
        return image;
    }

    async migrateVirtualCard(uid, customerUid, poolUid) {
        const cardData = await this._debitCardService.migrateVirtualCard(uid, customerUid, poolUid);
        return cardData;
    }
}

module.exports = DebitCardController;
